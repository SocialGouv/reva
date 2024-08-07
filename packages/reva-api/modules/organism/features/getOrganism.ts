import { prismaClient } from "../../../prisma/client";

export const getOrganismById = async ({ organismId }: { organismId: string }) =>
  prismaClient.organism.findUnique({
    where: { id: organismId },
  });
