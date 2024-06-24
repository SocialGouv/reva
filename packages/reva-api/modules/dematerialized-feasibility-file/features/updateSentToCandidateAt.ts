import { prismaClient } from "../../../prisma/client";

export const updateSentToCandidateAtNow = async ({
  dematerializedFeasibilityFileId,
}: {
  dematerializedFeasibilityFileId: string;
}) => {
  const now = new Date().toISOString();
  await prismaClient.dematerializedFeasibilityFile.update({
    where: { id: dematerializedFeasibilityFileId },
    data: { sentToCandidateAt: now },
  });

  return "Ok";
};
