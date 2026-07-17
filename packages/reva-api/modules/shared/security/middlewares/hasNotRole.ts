import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED } from "@/modules/shared/security/messages";

export const hasNotRole =
  (roles: KeyCloakUserRole[]) =>
  (next: IFieldResolver<unknown>) =>
  (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    if (roles.some((role) => context.auth.hasRole(role))) {
      throw new Error(NOT_AUTHORIZED);
    }
    return next(root, args, context, info);
  };
