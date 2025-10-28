import { IFieldResolver, MercuriusContext } from "mercurius";

import { prismaClient } from "@/prisma/client";

import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";
import { getMaisonMereAAPByGestionnaireAccountId } from "../features/getMaisonMereAAPByGestionnaireAccountId";

export const isOwnerOrCanManageOrganism =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const organismId =
      args.organismId || args.data?.organismId || root.organismId || root.id;

    if (!organismId) {
      throw new Error("ID de l'organisme requis");
    }

    const account = await getAccountByKeycloakId({
      keycloakId: context.auth.userInfo?.sub || "",
    });

    if (!account) {
      throw new Error("Utilisateur non autorisé");
    }

    const maisonMereAAP = await getMaisonMereAAPByGestionnaireAccountId({
      gestionnaireAccountId: account.id,
    });

    const organismOnAccounts = await prismaClient.organismOnAccount.findMany({
      where: {
        accountId: account.id,
      },
    });

    // Pour pouvoir accéder à l'agence, il faut remplir au moins une condition parmi :
    // - Être admin
    // - Être le gestionnaire de l'agence
    // - Être le gestionnaire de la maison mere
    if (
      !context.auth.hasRole("admin") &&
      !organismOnAccounts.some((oa) => oa.organismId === organismId) &&
      !maisonMereAAP
    ) {
      throw new Error("Utilisateur non autorisé");
    }

    return next(root, args, context, info);
  };
