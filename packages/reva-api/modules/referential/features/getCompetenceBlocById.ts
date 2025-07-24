import { prismaClient } from "@/prisma/client";

export const getCompetenceBlocById = async ({
  competenceBlocId,
}: {
  competenceBlocId: string;
}) =>
  prismaClient.certificationCompetenceBloc.findUnique({
    where: { id: competenceBlocId },
  });
