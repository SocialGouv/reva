import { prismaClient } from "../../../prisma/client";

export const getCohortesVaeCollectivesByCommanditaireVaeCollectiveId = async ({
  commanditaireVaeCollectiveId,
}: {
  commanditaireVaeCollectiveId: string;
}) =>
  prismaClient.commanditaireVaeCollective
    .findUnique({
      where: { id: commanditaireVaeCollectiveId },
    })
    .cohorteVaeCollectives();
