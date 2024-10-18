import { IFieldResolver, MercuriusContext } from "mercurius";

export const whenHasRoleButNotOthers =
  (
    role: KeyCloakUserRole,
    blackListedRoles: KeyCloakUserRole[],
    ifHasRoleButNotOthersResolver: (
      next: IFieldResolver<unknown>,
    ) => IFieldResolver<unknown>,
  ) =>
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    if (
      context.auth.hasRole(role) &&
      !blackListedRoles.some((blackListedRole) =>
        context.auth.hasRole(blackListedRole),
      )
    ) {
      return ifHasRoleButNotOthersResolver(next)(root, args, context, info);
    } else {
      return next(root, args, context, info);
    }
  };
