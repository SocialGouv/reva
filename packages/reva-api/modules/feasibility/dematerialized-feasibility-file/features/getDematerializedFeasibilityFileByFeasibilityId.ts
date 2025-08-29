import { prismaClient } from "@/prisma/client";

export const getDematerializedFeasibilityFileByFeasibilityId = ({
  feasibilityId,
}: {
  feasibilityId: string;
}) =>
  prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { feasibilityId },
    include: {
      dffCertificationCompetenceBlocs: true,
    },
  });
