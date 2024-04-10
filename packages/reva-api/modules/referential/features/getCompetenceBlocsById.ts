import { prismaClient } from "../../../prisma/client";

export const getCompetenceBlocsById = async ({
  competenceBlocId,
}: {
  competenceBlocId: string;
}) =>
  prismaClient.certificationCompetenceBloc.findUnique({
    where: { id: competenceBlocId },
  });
