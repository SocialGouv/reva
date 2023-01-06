import { Account } from "@prisma/client";
import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import { Role } from "../types/account";
import { Candidacy, DropOutReason } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";
import {
  CanManageCandidacyDeps,
  CanManageCandidacyParams,
} from "./canManageCandidacy";

interface DropOutCandidacyDeps {
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
  getDropOutReasonById: (params: {
    dropOutReasonId: string;
  }) => Promise<Either<string, Maybe<DropOutReason>>>;
  hasRole: (role: Role) => boolean;
  dropOutCandidacy: (
    params: DropOutCandidacyParams
  ) => Promise<Either<string, Candidacy>>;
  canManageCandidacy: (
    deps: CanManageCandidacyDeps,
    params: CanManageCandidacyParams
  ) => Promise<Either<string, boolean>>;
  getAccountFromKeycloakId: (
    candidacyId: string
  ) => Promise<Either<string, Account>>;
}

interface DropOutCandidacyParams {
  candidacyId: string;
  dropOutReasonId: string;
  droppedOutAt: Date;
  otherReasonContent?: string;
  keycloakId: string;
}

export const dropOutCandidacy =
  (deps: DropOutCandidacyDeps) => (params: DropOutCandidacyParams) => {
    const canManageCandidacy = EitherAsync.fromPromise(() =>
      deps.canManageCandidacy(
        {
          getAccountFromKeycloakId: deps.getAccountFromKeycloakId,
          getCandidacyFromId: deps.getCandidacyFromId,
          hasRole: deps.hasRole,
        },
        { candidacyId: params.candidacyId, keycloakId: params.keycloakId }
      )
    )
      .chain((isAllowed) =>
        EitherAsync.liftEither(
          isAllowed
            ? Right(true)
            : Left(`Vous n'êtes pas authorisé à traiter cette candidature.`)
        )
      )
      .mapLeft(
        (error) =>
          new FunctionalError(FunctionalCodeError.NOT_AUTHORIZED, error)
      );

    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const checkIfCandidacyIsNotAbandonned = (candidacy: Candidacy) => {
      const canDropOut = !candidacy.candidacyStatuses.some(
        (s) => s.status === "ABANDON"
      );
      return Promise.resolve(
        Maybe.fromFalsy(canDropOut).toEither(
          new FunctionalError(
            FunctionalCodeError.CANDIDACY_ALREADY_DROPPED_OUT,
            `La candidature est déjà abandonnée`
          )
        )
      );
    };

    const checkIfDropOutReasonExists = EitherAsync.fromPromise(() =>
      deps.getDropOutReasonById(params)
    )
      .mapLeft(
        (error: string) =>
          new FunctionalError(
            FunctionalCodeError.CANDIDACY_DROP_OUT_FAILED,
            error
          )
      )
      .chain(async (maybeDropOutReason: Maybe<DropOutReason>) => {
        return maybeDropOutReason.toEither(
          new FunctionalError(
            FunctionalCodeError.CANDIDACY_INVALID_DROP_OUT_REASON,
            `La raison d'abandon n'est pas valide`
          )
        );
      });

    const dropOutCandidacyResult = EitherAsync.fromPromise(() =>
      deps.dropOutCandidacy(params)
    ).mapLeft(
      (error: string) =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DROP_OUT_FAILED,
          error
        )
    );

    return checkIfCandidacyExists
      .chain(checkIfCandidacyIsNotAbandonned)
      .chain(() => canManageCandidacy)
      .chain(() => checkIfDropOutReasonExists)
      .chain(() => dropOutCandidacyResult);
  };
