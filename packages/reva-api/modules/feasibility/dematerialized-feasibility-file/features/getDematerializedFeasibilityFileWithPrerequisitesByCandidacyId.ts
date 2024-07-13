import { prismaClient } from "../../../../prisma/client";

export const getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.dematerializedFeasibilityFile.findFirst({
    where: { feasibility: { candidacyId, isActive: true } },
    include: {
      prerequisites: true,
    },
  });
