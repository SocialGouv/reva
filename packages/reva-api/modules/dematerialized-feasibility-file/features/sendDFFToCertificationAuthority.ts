import { prismaClient } from "../../../prisma/client";

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

  return "Ok";
};
