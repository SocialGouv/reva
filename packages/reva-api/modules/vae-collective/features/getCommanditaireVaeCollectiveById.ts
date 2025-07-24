import { prismaClient } from "@/prisma/client";

export const getCommanditaireVaeCollectiveById = ({
  commanditaireVaeCollectiveId,
}: {
  commanditaireVaeCollectiveId?: string;
}) =>
  commanditaireVaeCollectiveId
    ? prismaClient.commanditaireVaeCollective.findUnique({
        where: { id: commanditaireVaeCollectiveId },
      })
    : null;
