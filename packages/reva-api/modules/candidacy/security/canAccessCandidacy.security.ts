import { IFieldResolver, MercuriusContext } from "mercurius";
import { canAccessCandidacy as canAccessCandidacyFeature } from "../features/canAccessCandidacy";

export const canAccessCandidacy =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    if (
      !(await canAccessCandidacyFeature({
        roles: context.auth.userInfo.realm_access?.roles || [],
        candidacyId: args["id"],
        keycloakId: context.auth.userInfo.sub,
      }))
    ) {
      throw new Error("Vous n'êtes pas autorisé à accéder à cette candidature");
    }
    return next(root, args, context, info);
  };
