import { prismaClient } from "../../../prisma/client";
import { sendDFFNotificationToCertificationAuthorityEmail } from "../emails";

export const sendDFFToCertificationAuthority = async ({
  dematerializedFeasibilityFileId,
  certificationAuthorityId,
}: {
  dematerializedFeasibilityFileId: string;
  certificationAuthorityId: string;
}) => {
  const now = new Date().toISOString();
  await prismaClient.dematerializedFeasibilityFile.update({
    where: { id: dematerializedFeasibilityFileId },
    data: {
      sentToCertificationAuthorityAt: now,
      certificationAuthorityId,
    },
  });

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
