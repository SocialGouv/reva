import { prismaClient } from "@/prisma/client";

export const createCohorteVaeCollective = async ({
  commanditaireVaeCollectiveId,
  nomCohorteVaeCollective,
}: {
  commanditaireVaeCollectiveId: string;
  nomCohorteVaeCollective: string;
}) =>
  prismaClient.cohorteVaeCollective.create({
    data: {
      nom: nomCohorteVaeCollective,
      commanditaireVaeCollectiveId: commanditaireVaeCollectiveId,
    },
  });
