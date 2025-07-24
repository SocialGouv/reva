import { prismaClient } from "@/prisma/client";

export const getDFFCertificationCompetenceBlocByDFFIdAndCertificationCompetenceBlocId =
  ({
    dematerializedFeasibilityFileId,
    certificationCompetenceBlocId,
  }: {
    dematerializedFeasibilityFileId: string;
    certificationCompetenceBlocId: string;
  }) =>
    prismaClient.dFFCertificationCompetenceBloc.findFirst({
      where: { dematerializedFeasibilityFileId, certificationCompetenceBlocId },
    });
