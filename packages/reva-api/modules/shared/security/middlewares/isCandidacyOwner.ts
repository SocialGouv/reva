import debug from "debug";
import { IFieldResolver, MercuriusContext } from "mercurius";

import { canManageCandidacy } from "../../../candidacy/features/canManageCandidacy";

const log = debug("gql:security");

export const isCandidacyOwner =
  (next: IFieldResolver<unknown>) =>
  async (
    root: unknown,
    args: { candidacyId?: string; [x: string]: unknown },
    context: MercuriusContext,
    info: any
  ) => {
    log("isCandidacyOwner");
    const candidacyId = args.candidacyId ?? "";
    const keycloakId = context.auth.userInfo?.sub ?? "";

    const authorized = await canManageCandidacy({
      hasRole: context.auth.hasRole,
      candidacyId,
      keycloakId,
    });
    if (!authorized) {
      log("not authorized");
      throw new Error("Vous n'êtes pas autorisé à gérer cette candidature.");
    }
    log("authorized");
    return next(root, args, context, info);
  };
