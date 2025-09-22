import { getAccountById } from "@/modules/account/features/getAccount";
import { updateCandidacyStatus } from "@/modules/candidacy/features/updateCandidacyStatus";
import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { assignCandidacyToCertificationAuthorityLocalAccounts } from "@/modules/certification-authority/features/assignCandidacyToCertificationAuthorityLocalAccounts";
import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { prismaClient } from "@/prisma/client";

import { sendNewFeasibilitySubmittedEmail } from "../../emails/sendNewFeasibilitySubmittedEmail";

export const sendDFFToCertificationAuthority = async ({
  dematerializedFeasibilityFileId,
  certificationAuthorityId,
  candidacyId,
  context,
}: {
  dematerializedFeasibilityFileId: string;
  certificationAuthorityId: string;
  candidacyId: string;
  context: GraphqlContext;
}) => {
  const now = new Date().toISOString();

  const existingFeasibility = await prismaClient.feasibility.findFirst({
    where: { candidacyId, isActive: true },
  });

  try {
    const candidacy = await prismaClient.$transaction(async (tx) => {
      await tx.feasibility.updateMany({
        where: { candidacyId, isActive: true },
        data: {
          certificationAuthorityId,
          feasibilityFileSentAt: now,
          decision: "PENDING",
        },
      });
      return updateCandidacyStatus({
        candidacyId,
        status: "DOSSIER_FAISABILITE_ENVOYE",
        tx,
      });
    });

    if (!candidacy) {
      throw new Error("Could not update candidacy");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

  // Update certification authority local accounts only if certificationAuthorityId has been changed
  if (
    existingFeasibility?.certificationAuthorityId &&
    existingFeasibility.certificationAuthorityId != certificationAuthorityId
  ) {
    // Remove candidacy from any certification authority local account
    await prismaClient.certificationAuthorityLocalAccountOnCandidacy.deleteMany(
      {
        where: { candidacyId },
      },
    );

    await assignCandidacyToCertificationAuthorityLocalAccounts({
      candidacyId,
    });
  }

  // Assign certification authority local accounts only on new feasibility or if !existingFeasibility.certificationAuthorityId
  if (!existingFeasibility || !existingFeasibility.certificationAuthorityId) {
    await assignCandidacyToCertificationAuthorityLocalAccounts({
      candidacyId,
    });
  }

  const dff = await prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { id: dematerializedFeasibilityFileId },
    include: {
      feasibility: {
        include: { certificationAuthority: true, candidacy: true },
      },
    },
  });

  if (!dff) {
    throw new Error("Dossier de faisabilité dématérialisé non trouvé");
  }

  // sending a mail notification to candidacy certification authority and related certification authority local accounts

  const certificationAuthority = dff?.feasibility?.certificationAuthority;
  const certificationAuthorityLocalAccounts =
    await prismaClient.certificationAuthorityLocalAccount.findMany({
      where: {
        certificationAuthorityLocalAccountOnCandidacy: {
          some: { candidacyId },
        },
      },
    });

  const emails = [];
  if (certificationAuthority?.contactEmail) {
    emails.push(certificationAuthority?.contactEmail);
  }

  for (const cala of certificationAuthorityLocalAccounts) {
    const account = await getAccountById({ id: cala.accountId });
    emails.push(account.email);
  }

  const feasibilityUrl = getBackofficeUrl({
    path: `/candidacies/${dff.feasibility.candidacyId}/feasibility`,
  });

  if (emails.length) {
    await sendNewFeasibilitySubmittedEmail({
      emails,
      feasibilityUrl,
    });
  }

  await logCandidacyAuditEvent({
    candidacyId: dff.feasibility.candidacyId,
    eventType: "DFF_SENT_TO_CERTIFICATION_AUTHORITY",
    userKeycloakId: context.auth.userInfo?.sub,
    userEmail: context.auth.userInfo?.email,
    userRoles: context.auth.userInfo?.realm_access?.roles || [],
    details: {
      certificationAuthorityId: certificationAuthority?.id,
      certificationAuthorityLabel: certificationAuthority?.label,
    },
  });

  return "Ok";
};
