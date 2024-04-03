import { prismaClient } from "../../../prisma/client";

export const getCompetenceBlocsAndCompetencesByIds = ({
  competenceBlocIds,
}: {
  competenceBlocIds: string[];
}) =>
  prismaClient.certificationCompetenceBloc.findMany({
    where: { id: { in: competenceBlocIds } },
    include: { competences: true },
  });
