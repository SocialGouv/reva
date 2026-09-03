import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_RESOURCE_ACCESS } from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";

export const isGestionnaireOfSousCompteVaeCollective =
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
      throw new Error(NOT_AUTHORIZED_RESOURCE_ACCESS);
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
      throw new Error(NOT_AUTHORIZED_RESOURCE_ACCESS);
    }

    const sousCompteVaeCollectiveId =
      args.sousCompteVaeCollectiveId ||
      args.data?.sousCompteVaeCollectiveId ||
      root?.sousCompteVaeCollectiveId;

    if (!sousCompteVaeCollectiveId) {
      throw new Error(NOT_AUTHORIZED_RESOURCE_ACCESS);
    }

    const sousCompteVaeCollective =
      await prismaClient.sousCompteVaeCollective.findUnique({
        where: {
          id: sousCompteVaeCollectiveId,
          commanditaireVaeCollectiveId: commanditaireVaeCollectiveId,
        },
      });

    if (!sousCompteVaeCollective) {
      throw new Error(NOT_AUTHORIZED_RESOURCE_ACCESS);
    }

    return next(root, args, context, info);
  };
