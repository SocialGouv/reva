import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import { existsCandidacyWithActiveStatuses } from "../../infra/database/postgres/candidacies";
import { Role } from "../types/account";
import { Candidacy, DropOutReason } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

// Check rights
// - current status is not abandon
// - (candidacy is related to AP)

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
}

interface DropOutCandidacyParams {
  candidacyId: string;
  dropOutReasonId: string;
  dropOutDate: Date;
  otherReasonContent?: string;
}

export const dropOutCandidacy =
  (deps: DropOutCandidacyDeps) => (params: DropOutCandidacyParams) => {
    const hasRequiredRole =
      deps.hasRole("manage_candidacy") || deps.hasRole("admin") || true;
    if (!hasRequiredRole) {
      return EitherAsync.liftEither(
        Left(
          `Vous n'êtes pas autorisé à déclarer l'abandon de cette candidature.`
        )
      ).mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.NOT_AUTHORIZED, error)
      );
    }

    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );
    // .chain(async (maybeCandidacy: Maybe<Candidacy>) => {
    //   return maybeCandidacy.toEither(
    //     new FunctionalError(
    //       FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
    //       `La candidature n'existe pas`
    //     )
    //   );
    // });

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
      .chain(() => checkIfDropOutReasonExists)
      .chain(() => dropOutCandidacyResult);
  };
