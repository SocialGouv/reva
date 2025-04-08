import { assignCandidadyToCertificationAuthorityLocalAccounts } from "../../../certification-authority/features/assignCandidadyToCertificationAuthorityLocalAccounts";
import { prismaClient } from "../../../../prisma/client";
import { logCandidacyAuditEvent } from "../../../candidacy-log/features/logCandidacyAuditEvent";
import { updateCandidacyStatus } from "../../../candidacy/features/updateCandidacyStatus";
import { sendDFFNotificationToCertificationAuthorityEmail } from "../emails";
import { getAccountById } from "../../../account/features/getAccount";

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

    await assignCandidadyToCertificationAuthorityLocalAccounts({
      candidacyId,
    });
  }

  // Assign certification authority local accounts only on new feasibility or if !existingFeasibility.certificationAuthorityId
  if (!existingFeasibility || !existingFeasibility.certificationAuthorityId) {
    await assignCandidadyToCertificationAuthorityLocalAccounts({
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
        CertificationAuthorityLocalAccountOnCandidacy: {
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

  if (emails.length) {
    await sendDFFNotificationToCertificationAuthorityEmail({
      emails,
      candidacyId: dff.feasibility.candidacyId,
    });
  }

  await logCandidacyAuditEvent({
    candidacyId: dff.feasibility.candidacyId,
    eventType: "DFF_SENT_TO_CERTIFICATION_AUTHORITY",
    userKeycloakId: context.auth.userInfo?.sub,
    userEmail: context.auth.userInfo?.email,
    userRoles: context.auth.userInfo?.realm_access?.roles || [],
  });

  return "Ok";
};
