import { Either, EitherAsync, Maybe } from "purify-ts";

import { Candidacy } from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { DropOutReason } from "../../referential/referential.types";

interface DropOutCandidacyDeps {
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
  getDropOutReasonById: (params: {
    dropOutReasonId: string;
  }) => Promise<Either<string, Maybe<DropOutReason>>>;
  dropOutCandidacy: (
    params: DropOutCandidacyParams
  ) => Promise<Either<string, Candidacy>>;
}

interface DropOutCandidacyParams {
  candidacyId: string;
  dropOutReasonId: string;
  droppedOutAt: Date;
  otherReasonContent?: string;
}

export const dropOutCandidacy =
  (deps: DropOutCandidacyDeps) => (params: DropOutCandidacyParams) => {
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
      const hasDropOut = Boolean(candidacy.candidacyDropOut);
      return Promise.resolve(
        Maybe.fromFalsy(!hasDropOut).toEither(
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
