import { IFieldResolver, MercuriusContext } from "mercurius";

import { getAccountByKeycloakId } from "../features/getAccountByKeycloakId";

export const isOwnerOfAccount =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const account = await getAccountByKeycloakId({
      keycloakId: context.auth.userInfo.sub,
    });
    if (!account || account.id !== args.accountId) {
      throw new Error("Vous n'êtes pas autorisé à accéder à ce compte");
    }
    return next(root, args, context, info);
  };
