import { prismaClient } from "@/prisma/client";

export const getJuryResultByCompetenceBlocsByJuryId = async ({
  juryId,
}: {
  juryId: string;
}) => {
  return prismaClient.jury
    .findUnique({
      where: { id: juryId },
    })
    .juryResultByCompetenceBlocs();
};
