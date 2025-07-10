import { prismaClient } from "../../../prisma/client";

export const getCommanditaireVaeCollectiveByGestionnaireAccountId = async ({
  gestionnaireAccountId,
}: {
  gestionnaireAccountId: string;
}) =>
  prismaClient.commanditaireVaeCollective.findFirst({
    where: { gestionnaireAccountId },
  });
