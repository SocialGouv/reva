import { prismaClient } from "../../../../prisma/client";

export const getPrerequisitesByDFFId = ({
  dematerializedFeasibilityFileId,
}: {
  dematerializedFeasibilityFileId: string;
}) =>
  prismaClient.dFFPrerequisite.findMany({
    where: {
      dematerializedFeasibilityFileId,
    },
  });
