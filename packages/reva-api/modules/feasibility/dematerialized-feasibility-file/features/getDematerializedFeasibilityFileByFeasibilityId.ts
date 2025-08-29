import { prismaClient } from "@/prisma/client";

export const getDematerializedFeasibilityFileByFeasibilityId = ({
  feasibilityId,
}: {
  feasibilityId: string;
}) =>
  prismaClient.dematerializedFeasibilityFile.findFirst({
    where: { feasibilityId },
    include: {
      dffCertificationCompetenceBlocs: true,
    },
  });
