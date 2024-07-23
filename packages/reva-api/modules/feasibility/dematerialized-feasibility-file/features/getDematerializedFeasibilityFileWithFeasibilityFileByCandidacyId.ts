import { prismaClient } from "../../../../prisma/client";

export const getDematerializedFeasibilityFileWithFeasibilityFileByCandidacyId =
  ({ candidacyId }: { candidacyId: string }) =>
    prismaClient.dematerializedFeasibilityFile.findFirst({
      where: { feasibility: { candidacyId, isActive: true } },
      include: { feasibility: true },
    });
