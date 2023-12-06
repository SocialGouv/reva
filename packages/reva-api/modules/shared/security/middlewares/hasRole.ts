import { IFieldResolver, MercuriusContext } from "mercurius";

export const hasRole =
  (roles: KeyCloakUserRole[]) =>
  (next: IFieldResolver<unknown>) =>
  (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any
  ) => {
    if (!context.auth.userInfo) {
      throw new Error("Votre session a expiré, veuillez vous reconnecter.");
    }

    if (!roles.some((role) => context.auth.hasRole(role))) {
      throw new Error("You are not authorized!");
    }
    return next(root, args, context, info);
  };
