import { IFieldResolver, MercuriusContext } from "mercurius";

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
