import { prismaClient } from "@/prisma/client";

export const getCertificationCompetenceBlocById = async ({
  certificationCompetenceBlocId,
}: {
  certificationCompetenceBlocId: string;
}) =>
  prismaClient.certificationCompetenceBloc.findUnique({
    where: {
      id: certificationCompetenceBlocId,
    },
  });
