import { prismaClient } from "../../../../prisma/client";

export const confirmDematerializedFeasibilityFileByCandidate = async ({
  dematerializedFeasibilityFileId,
}: {
  dematerializedFeasibilityFileId: string;
}) =>
  prismaClient.dematerializedFeasibilityFile.update({
    where: { id: dematerializedFeasibilityFileId },
    data: { candidateConfirmationAt: new Date().toISOString() },
  });
