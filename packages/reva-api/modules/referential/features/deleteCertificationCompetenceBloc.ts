import { prismaClient } from "../../../prisma/client";

export const deleteCertificationCompetenceBloc = async ({
  certificationCompetenceBlocId,
}: {
  certificationCompetenceBlocId: string;
}) =>
  prismaClient.certificationCompetenceBloc.delete({
    where: { id: certificationCompetenceBlocId },
  });
