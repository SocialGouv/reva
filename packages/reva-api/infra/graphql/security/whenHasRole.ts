import { IFieldResolver, MercuriusContext } from "mercurius";
import debug from "debug";

const log = debug("gql:security:whenHasRole")
export const whenHasRole =
  (role: KeyCloakUserRole, ifHasRoleResolver: (next: IFieldResolver<unknown>) => IFieldResolver<unknown>) =>
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any
  ) => {
    log("user:", context.auth.userInfo.sub);
    if (context.auth.hasRole(role)) {
      log("user have required role")
        return ifHasRoleResolver(next)(root, args, context, info);
    }
  };
