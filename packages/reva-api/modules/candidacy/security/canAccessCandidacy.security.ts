import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_CANDIDACY_ACCESS } from "@/modules/shared/security/messages";

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
      throw new Error(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    }
    return next(root, args, context, info);
  };
