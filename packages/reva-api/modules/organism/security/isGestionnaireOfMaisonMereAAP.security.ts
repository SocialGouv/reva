import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_MAISON_MERE_ACCESS } from "@/modules/shared/security/messages";

import { isUserGestionnaireMaisonMereAAPOfMaisonMereAAP } from "../features/isUserGestionnaireMaisonMereAAPOfMaisonMereAAP";

export const isGestionnaireOfMaisonMereAAP =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    if (
      !(await isUserGestionnaireMaisonMereAAPOfMaisonMereAAP({
        userRoles: context.auth.userInfo.realm_access?.roles || [],
        maisonMereAAPId:
          args.maisonMereAAPId ||
          args.data?.maisonMereAAPId ||
          root.maisonMereAAPId ||
          root.id,
        userKeycloakId: context.auth.userInfo.sub,
      }))
    ) {
      throw new Error(NOT_AUTHORIZED_MAISON_MERE_ACCESS);
    }
    return next(root, args, context, info);
  };
