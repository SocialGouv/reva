import { IFieldResolver, MercuriusContext } from "mercurius";

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
        maisonMereAAPId: args.maisonMereAAPId || args.data?.maisonMereAAPId || root.maisonMereAAPId,
        userKeycloakId: context.auth.userInfo.sub,
      }))
    ) {
      throw new Error("Vous n'êtes pas autorisé à accéder à cette candidature");
    }
    return next(root, args, context, info);
  };
