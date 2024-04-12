import { prismaClient } from "../../../prisma/client";

export const getCertificationCompetencesByBlocId = ({
  certificationCompetenceBlocId,
}: {
  certificationCompetenceBlocId: string;
}) =>
  prismaClient.certificationCompetence.findMany({
    where: { blocId: certificationCompetenceBlocId },
    orderBy: { index: "asc" },
  });
