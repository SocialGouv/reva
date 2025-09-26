import debug from "debug";
import { IFieldResolver, MercuriusContext } from "mercurius";

import { canManageCandidacy } from "@/modules/candidacy/features/canManageCandidacy";

const log = debug("gql:security");

export const isCandidacyOwner =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    log("isCandidacyOwner");
    const candidacyId =
      args.candidacyId ||
      args.data?.candidacyId ||
      args.input?.candidacyId ||
      root.candidacyId ||
      root.id;
    if (!candidacyId) {
      throw new Error("Candidacy ID is required in isCandidacyOwner");
    }
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
