import { ErrorWithProps, IFieldResolver, MercuriusContext } from "mercurius";

import {
  NOT_AUTHORIZED,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";

export const hasRole =
  (roles: KeyCloakUserRole[]) =>
  (next: IFieldResolver<unknown>) =>
  (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    if (!context.auth.userInfo) {
      throw new ErrorWithProps(SESSION_EXPIRED, {
        code: "UNAUTHENTICATED",
      });
    }

    if (!roles.some((role) => context.auth.hasRole(role))) {
      throw new Error(NOT_AUTHORIZED);
    }
    return next(root, args, context, info);
  };
