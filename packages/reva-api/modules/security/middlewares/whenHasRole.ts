import debug from "debug";
import { IFieldResolver, MercuriusContext } from "mercurius";

export const whenHasRole =
  (
    role: KeyCloakUserRole,
    ifHasRoleResolver: (
      next: IFieldResolver<unknown>
    ) => IFieldResolver<unknown>
  ) =>
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any
  ) => {
    const log = debug("gql:security:whenHasRole");
    log("user:", context.auth.userInfo.sub);
    if (context.auth.hasRole(role)) {
      log("user have required role");
      return ifHasRoleResolver(next)(root, args, context, info);
    }
  };
