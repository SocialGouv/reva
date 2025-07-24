import { prismaClient } from "@/prisma/client";

export const getOrganismById = async ({
  organismId,
}: {
  organismId: string;
}) => {
  if (!organismId) {
    return null;
  }
  return prismaClient.organism.findUnique({
    where: { id: organismId },
  });
};
