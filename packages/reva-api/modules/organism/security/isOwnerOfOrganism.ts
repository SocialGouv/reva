import { IFieldResolver, MercuriusContext } from "mercurius";

import { isUserOwnerOfOrganism } from "../features/isUserOwnerOfOrganism";

export const isOwnerOfOrganism =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    if (
      !(await isUserOwnerOfOrganism({
        userRoles: context.auth.userInfo.realm_access?.roles || [],
        organismId:
          args.organismId ||
          args.data?.organismId ||
          root.organismId ||
          root.id,
        userKeycloakId: context.auth.userInfo.sub,
      }))
    ) {
      throw new Error("Vous n'êtes pas autorisé à accéder à cet organisme");
    }
    return next(root, args, context, info);
  };
