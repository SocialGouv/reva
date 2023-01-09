import debug from "debug";
import { EitherAsync, Left, Right } from "purify-ts";

import { canManageCandidacy } from "../../../domain/features/canManageCandidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../domain/types/functionalError";
import { getAccountFromKeycloakId } from "../../database/postgres/accounts";
import { getCandidacyFromId } from "../../database/postgres/candidacies";
import {
  ResolverContext,
  ResolverFirstArgument,
  ResolverPayload,
} from "../types";
import { SecurityCheck } from ".";

const log = debug("gql");

export const checkCanManageCandidacy: SecurityCheck = (
  _: ResolverFirstArgument,
  payload: ResolverPayload,
  context: ResolverContext
) => {
  const candidacyId = payload.candidacyId ?? "";
  const keycloakId = context.auth.userInfo?.sub ?? "";
  return EitherAsync.fromPromise(() =>
    canManageCandidacy(
      {
        hasRole: context.auth.hasRole,
        getAccountFromKeycloakId,
        getCandidacyFromId,
      },
      { candidacyId, keycloakId }
    )
  )
    .mapLeft((err) => {
      const message = `canManageCandidacy Failed: ${err}`;
      log("Technical error - ", message);
      return new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, message);
    })
    .chain(async (isAllowed: boolean) => {
      if (!isAllowed) {
        log("checkCanManageCandidacy : not allowed");
        return Left(
          new FunctionalError(
            FunctionalCodeError.NOT_AUTHORIZED,
            "Vous n'êtes pas autorisé à gérer cette candidature"
          )
        );
      }
      log("checkCanManageCandidacy : ok");
      return Right(true);
    });
};
