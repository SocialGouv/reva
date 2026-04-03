import { IFieldResolver, MercuriusContext } from "mercurius";

import { prismaClient } from "@/prisma/client";

const UNAUTHORIZED_ACCESS_ERROR =
  "Vous n'êtes pas autorisé à accéder à cette ressource";

export const isGestionnaireOfCohorteVaeCollective =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const userKeycloakId = context.auth?.userInfo?.sub;

    const commanditaireVaeCollectiveId =
      args.commanditaireVaeCollectiveId ||
      args.data?.commanditaireVaeCollectiveId ||
      root?.commanditaireVaeCollectiveId ||
      root?.id;

    if (!commanditaireVaeCollectiveId) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    const commanditaireVaeCollective =
      await prismaClient.commanditaireVaeCollective.findUnique({
        where: {
          id: commanditaireVaeCollectiveId,
          gestionnaire: {
            keycloakId: userKeycloakId,
          },
        },
      });

    if (!commanditaireVaeCollective) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    const cohorteVaeCollectiveId =
      args.cohorteVaeCollectiveId ||
      args.data?.cohorteVaeCollectiveId ||
      root?.cohorteVaeCollectiveId;

    if (!cohorteVaeCollectiveId) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    const cohorteVaeCollective =
      await prismaClient.cohorteVaeCollective.findUnique({
        where: {
          id: cohorteVaeCollectiveId,
          commanditaireVaeCollectiveId: commanditaireVaeCollectiveId,
        },
      });

    if (!cohorteVaeCollective) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    return next(root, args, context, info);
  };
