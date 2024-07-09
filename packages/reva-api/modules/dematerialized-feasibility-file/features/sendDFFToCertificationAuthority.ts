import { prismaClient } from "../../../prisma/client";
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
    prismaClient.dematerializedFeasibilityFile.update({
      where: { id: dematerializedFeasibilityFileId },
      data: {
        sentToCertificationAuthorityAt: now,
        certificationAuthorityId,
      },
    }),
  ]);

  const dff = await prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { id: dematerializedFeasibilityFileId },
    include: { certificationAuthority: true },
  });

  if (dff?.certificationAuthority?.contactEmail) {
    await sendDFFNotificationToCertificationAuthorityEmail({
      email: dff.certificationAuthority.contactEmail,
      candidacyId: dff.candidacyId,
    });
  }

  return "Ok";
};
