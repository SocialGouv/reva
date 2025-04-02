import { assignCandidadyToCertificationAuthorityLocalAccounts } from "../../../certification-authority/features/assignCandidadyToCertificationAuthorityLocalAccounts";
import { prismaClient } from "../../../../prisma/client";
import { logCandidacyAuditEvent } from "../../../candidacy-log/features/logCandidacyAuditEvent";
import { updateCandidacyStatus } from "../../../candidacy/features/updateCandidacyStatus";
import { sendDFFNotificationToCertificationAuthorityEmail } from "../emails";

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

  await assignCandidadyToCertificationAuthorityLocalAccounts({
    candidacyId,
  });

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

  if (dff?.feasibility?.certificationAuthority?.contactEmail) {
    await sendDFFNotificationToCertificationAuthorityEmail({
      email: dff.feasibility.certificationAuthority.contactEmail,
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
