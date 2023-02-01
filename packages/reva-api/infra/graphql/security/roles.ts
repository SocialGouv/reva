import { IFieldResolver, MercuriusContext } from "mercurius";

import debug from "debug";

export const whenHasRole =
(role: KeyCloakUserRole, ifHasRoleResolver: (next: IFieldResolver<unknown>) => IFieldResolver<unknown>) =>
(next: IFieldResolver<unknown>) =>
async (
  root: any,
  args: Record<string, any>,
  context: MercuriusContext,
  info: any
  ) => {
    const log = debug("gql:security:whenHasRole")
    log("user:", context.auth.userInfo.sub);
    if (context.auth.hasRole(role)) {
      log("user have required role")
        return ifHasRoleResolver(next)(root, args, context, info);
    }
  };

export const hasRole =
  (roles: KeyCloakUserRole[]) =>
  (next: IFieldResolver<unknown>) =>
  (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any
  ) => {
    if (!roles.some((role) => context.auth.hasRole(role))) {
      throw new Error("You are not authorized!");
    }
    return next(root, args, context, info);
  };

export const hasNotRole =
  (roles: KeyCloakUserRole[]) =>
  (next: IFieldResolver<unknown>) =>
  (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any
  ) => {
    if (roles.some((role) => context.auth.hasRole(role))) {
      throw new Error("You are not authorized!");
    }
    return next(root, args, context, info);
  };
