import { prismaClient } from "../../../../prisma/client";
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

  await prismaClient.$transaction([
    prismaClient.candidaciesStatus.updateMany({
      where: {
        candidacyId: candidacyId,
      },
      data: {
        isActive: false,
      },
    }),
    prismaClient.candidaciesStatus.create({
      data: {
        status: "DOSSIER_FAISABILITE_ENVOYE",
        isActive: true,
        candidacyId,
      },
    }),
    prismaClient.feasibility.updateMany({
      where: { candidacyId, isActive: true },
      data: {
        certificationAuthorityId,
        feasibilityFileSentAt: now,
      },
    }),
  ]);

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
