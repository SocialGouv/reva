import { prismaClient } from "@/prisma/client";

export const getCertificationCompetencesByBlocId = ({
  certificationCompetenceBlocId,
}: {
  certificationCompetenceBlocId: string;
}) =>
  prismaClient.certificationCompetenceBloc
    .findUnique({
      where: { id: certificationCompetenceBlocId },
    })
    .competences({ orderBy: { index: "asc" } });
