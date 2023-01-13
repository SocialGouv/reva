import { Either, EitherAsync, Left, Right } from "purify-ts";

import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface SubmitCandidacyDeps {
  updateCandidacyStatus: (params: {
    candidacyId: string;
    status: "VALIDATION";
  }) => Promise<Either<string, Candidacy>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
  existsCandidacyHavingHadStatus: (params: {
    candidacyId: string;
    status: "VALIDATION";
  }) => Promise<Either<string, boolean>>;
}

export const submitCandidacy =
  (deps: SubmitCandidacyDeps) => (params: { candidacyId: string }) => {
    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const validateCandidacyNotAlreadySubmitted = EitherAsync.fromPromise(() =>
      deps.existsCandidacyHavingHadStatus({
        candidacyId: params.candidacyId,
        status: "VALIDATION",
      })
    )
      .chain((existsCandidacy) => {
        if (existsCandidacy) {
          return EitherAsync.liftEither(
            Left(`Cette candidature ne peut être soumise à nouveau.`)
          );
        }
        return EitherAsync.liftEither(Right(existsCandidacy));
      })
      .mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.STATUS_NOT_UPDATED, error)
      );

    const updateContact = EitherAsync.fromPromise(() =>
      deps.updateCandidacyStatus({
        candidacyId: params.candidacyId,
        status: "VALIDATION",
      })
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.STATUS_NOT_UPDATED,
          `Erreur lors de la mise à jour du status`
        )
    );

    return checkIfCandidacyExists
      .chain(() => validateCandidacyNotAlreadySubmitted)
      .chain(() => updateContact);
  };
