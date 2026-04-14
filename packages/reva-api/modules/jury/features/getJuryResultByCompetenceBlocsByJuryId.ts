import { prismaClient } from "@/prisma/client";

export const getJuryResultByCompetenceBlocsByJuryId = async ({
  juryId,
}: {
  juryId: string;
}) => {
  console.log("juryId", juryId);
  return prismaClient.jury
    .findUnique({
      where: { id: juryId },
    })
    .juryResultByCompetenceBlocs();
};
