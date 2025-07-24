import { prismaClient } from "@/prisma/client";

export const updateOrganismLLToEarth = async ({
  organismId,
  llToEarth,
}: {
  organismId: string;
  llToEarth: string;
}) => {
  return await prismaClient.organism.update({
    where: { id: organismId },
    data: { llToEarth },
  });
};
