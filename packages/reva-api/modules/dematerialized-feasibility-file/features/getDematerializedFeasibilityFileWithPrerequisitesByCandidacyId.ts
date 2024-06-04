import { prismaClient } from "../../../prisma/client";

export const getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.dematerializedFeasibilityFile.findFirst({
    where: { candidacyId },
    include: {
      prerequisites: true,
    },
  });
