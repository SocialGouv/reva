import { Either, EitherAsync } from "purify-ts";

import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface SubmitCandidacyDeps {
  updateCandidacyStatus: (params: {
    candidacyId: string;
    status: "VALIDATION";
  }) => Promise<Either<string, Candidacy>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const submitCandidacy =
  (deps: SubmitCandidacyDeps) => (params: { candidacyId: string }) => {
    // TODO Check if a candidacy does not already exist with status VALIDATION
    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
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

    return checkIfCandidacyExists.chain(() => updateContact);
  };
