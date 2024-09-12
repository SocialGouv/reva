import { prismaClient } from "../../../../prisma/client";
import { updateCandidacyStatus } from "../../../candidacy/features/updateCandidacyStatus";
import { sendDFFNotificationToCertificationAuthorityEmail } from "../emails";

export const sendDFFToCertificationAuthority = async ({
  dematerializedFeasibilityFileId,
  certificationAuthorityId,
  candidacyId,
}: {
  dematerializedFeasibilityFileId: string;
  certificationAuthorityId: string;
  candidacyId: string;
}) => {
  const now = new Date().toISOString();

  try {
    const candidacy = await prismaClient.$transaction(async (tx) => {
      await prismaClient.feasibility.updateMany({
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

  const dff = await prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { id: dematerializedFeasibilityFileId },
    include: { feasibility: { include: { certificationAuthority: true } } },
  });

  if (dff?.feasibility?.certificationAuthority?.contactEmail) {
    await sendDFFNotificationToCertificationAuthorityEmail({
      email: dff.feasibility.certificationAuthority.contactEmail,
      candidacyId: dff.feasibility.candidacyId,
    });
  }

  return "Ok";
};
