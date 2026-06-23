import { getAccountById } from "@/modules/account/features/getAccount";
import { updateCertificationAuthorityOfCandidacy } from "@/modules/candidacy/certification/features/updateCertificationAuthorityOfCandidacy";
import { updateCandidacyStatus } from "@/modules/candidacy/features/updateCandidacyStatus";
import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { assignCandidacyToCertificationAuthorityLocalAccounts } from "@/modules/certification-authority/features/assignCandidacyToCertificationAuthorityLocalAccounts";
import { getAccountByCertificationAuthorityId } from "@/modules/certification-authority/features/getAccountByCertificationAuthorityId";
import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { prismaClient } from "@/prisma/client";

import { sendNewFeasibilitySubmittedEmail } from "../../emails/sendNewFeasibilitySubmittedEmail";
import { getWarningOnFeasibilitySubmissionForCandidacyId } from "../../features/getWarningOnFeasibealitySubmissionForCandidacyId";
import { throwErrorOnFeasibilitySubmissionWarning } from "../../features/throwErrorOnFeasibilitySubmissionWarning";

import { checkIsDFFReadyToBeSentToCertificationAuthorityById } from "./checkIsDFFReadyToBeSentToCertificationAuthorityById";
import { generateAndUploadFeasibilityFileByCandidacyId } from "./generateAndUploadFeasibilityFileByCandidacyId";

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
  // Get the feasibility submission warning
  const feasibilitySubmissionWarning =
    await getWarningOnFeasibilitySubmissionForCandidacyId(candidacyId);

  // Throw error if the feasibility submission warning is not NONE to avoid further processing
  throwErrorOnFeasibilitySubmissionWarning(feasibilitySubmissionWarning);

  const now = new Date().toISOString();

  const existingFeasibility = await prismaClient.feasibility.findFirst({
    where: { candidacyId, isActive: true },
    include: {
      dematerializedFeasibilityFile: true,
    },
  });

  if (!existingFeasibility?.dematerializedFeasibilityFile) {
    throw new Error("Dossier de faisabilité dématérialisé non trouvé");
  }

  const { dematerializedFeasibilityFile: existingDff } = existingFeasibility;

  if (existingDff.id !== dematerializedFeasibilityFileId) {
    throw new Error(
      "Le dossier de faisabilité dématérialisé n'est pas le même que celui de la candidature",
    );
  }

  if (existingFeasibility.decision === "INCOMPLETE") {
    if (
      !existingDff.candidateConfirmationAt ||
      !existingFeasibility.decisionSentAt ||
      existingDff.candidateConfirmationAt <= existingFeasibility.decisionSentAt
    ) {
      throw new Error(
        "Impossible d'envoyer le dossier au certificateur : le dossier doit être corrigé et re-validé par le candidat",
      );
    }
  }

  const isReadyToBeSentToCertificationAuthority =
    await checkIsDFFReadyToBeSentToCertificationAuthorityById({
      attachmentsPartComplete: existingDff.attachmentsPartComplete,
      certificationPartComplete: existingDff.certificationPartComplete,
      competenceBlocsPartCompletion: existingDff.competenceBlocsPartCompletion,
      prerequisitesPartComplete: existingDff.prerequisitesPartComplete,
      aapDecision: existingDff.aapDecision,
      eligibilityRequirement: existingDff.eligibilityRequirement,
      swornStatementFileId: existingDff.swornStatementFileId,
      candidateConfirmationAt: existingDff.candidateConfirmationAt,
      feasibilityDecision: existingFeasibility.decision,
      feasibilityDecisionSentAt: existingFeasibility.decisionSentAt,
    });
  if (!isReadyToBeSentToCertificationAuthority) {
    throw new Error(
      "Le dossier de faisabilité n'est pas prêt à être envoyé au certificateur",
    );
  }

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

  // Update certification authority local accounts only if certificationAuthorityId has been changed
  if (
    existingFeasibility.certificationAuthorityId &&
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
  if (!existingFeasibility.certificationAuthorityId) {
    await assignCandidacyToCertificationAuthorityLocalAccounts({
      candidacyId,
    });
  }

  // Generate and upload the feasibility file by candidacy id
  try {
    await generateAndUploadFeasibilityFileByCandidacyId(candidacyId);
  } catch (error) {
    console.error(error);
  }

  //update the certification authority of the candidacy
  await updateCertificationAuthorityOfCandidacy({
    candidacyId,
    certificationAuthorityId,
  });

  // sending a mail notification to candidacy certification authority and related certification authority local accounts

  const certificationAuthority =
    await prismaClient.certificationAuthority.findUnique({
      where: { id: certificationAuthorityId },
    });

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
    emails.push(certificationAuthority.contactEmail);
  } else {
    const account = await getAccountByCertificationAuthorityId({
      certificationAuthorityId,
    });
    if (account) {
      emails.push(account.email);
    }
  }

  for (const cala of certificationAuthorityLocalAccounts) {
    const account = await getAccountById({ id: cala.accountId });
    emails.push(account.email);
  }

  const feasibilityUrl = getBackofficeUrl({
    path: `/candidacies/${candidacyId}/feasibility`,
  });

  if (emails.length) {
    await sendNewFeasibilitySubmittedEmail({
      emails,
      feasibilityUrl,
    });
  }

  await logCandidacyAuditEvent({
    candidacyId,
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
