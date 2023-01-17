import { IFieldResolver, MercuriusContext } from "mercurius";
import { canManageCandidacy } from "../../../domain/features/canManageCandidacy";
import { getAccountFromKeycloakId } from "../../database/postgres/accounts";
import { getCandidacyFromId } from "../../database/postgres/candidacies";
import debug from "debug";
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

    const eitherIsAuthorized = await canManageCandidacy(
      {
        getAccountFromKeycloakId,
        getCandidacyFromId,
      },
      { candidacyId, keycloakId }
    );
    if (eitherIsAuthorized.isLeft()) {
      log("technical failure");
      throw new Error(eitherIsAuthorized.extract());
    }
    if (!eitherIsAuthorized.extract()) {
      log("not authorized");
      throw new Error("Vous n'êtes pas autorisé à gérer cette candidature.");
    }
    log("authorized");
    return next(root, args, context, info);
  };

