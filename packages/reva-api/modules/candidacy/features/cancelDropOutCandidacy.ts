import { Either, EitherAsync, Maybe } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { Candidacy } from "../candidacy.types";

interface CancelDropOutCandidacyDeps {
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
  cancelDropOutCandidacy: (
    params: CancelDropOutCandidacyParams
  ) => Promise<Either<string, Candidacy>>;
}

interface CancelDropOutCandidacyParams {
  candidacyId: string;
}

export const cancelDropOutCandidacy =
  (deps: CancelDropOutCandidacyDeps) =>
  (params: CancelDropOutCandidacyParams) => {
    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const checkIfCandidacyIsAbandonned = (candidacy: Candidacy) => {
      const hasDropOut = Boolean(candidacy.candidacyDropOut);
      return Promise.resolve(
        Maybe.fromFalsy(hasDropOut).toEither(
          new FunctionalError(
            FunctionalCodeError.CANDIDACY_NOT_DROPPED_OUT,
            `La candidature n'est pas abandonnée`
          )
        )
      );
    };

    const cancelDropOutCandidacyResult = EitherAsync.fromPromise(() =>
      deps.cancelDropOutCandidacy(params)
    ).mapLeft(
      (error: string) =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DROP_OUT_FAILED,
          error
        )
    );

    return checkIfCandidacyExists
      .chain(checkIfCandidacyIsAbandonned)
      .chain(() => cancelDropOutCandidacyResult);
  };
