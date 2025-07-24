import { prismaClient } from "@/prisma/client";

export const getDFFCertificationCompetenceBlocsByDFFId = ({
  dematerializedFeasibilityFileId,
}: {
  dematerializedFeasibilityFileId: string;
}) =>
  prismaClient.dFFCertificationCompetenceBloc.findMany({
    where: { dematerializedFeasibilityFileId },
    orderBy: { certificationCompetenceBloc: { code: "asc" } },
  });
