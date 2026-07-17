import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_ACCOUNT_ACCESS } from "@/modules/shared/security/messages";

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
      throw new Error(NOT_AUTHORIZED_ACCOUNT_ACCESS);
    }
    return next(root, args, context, info);
  };
