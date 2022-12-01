import { Either, EitherAsync } from "purify-ts";

import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface SelectOrganismForCandidacyDeps {
  updateOrganism: (params: {
    candidacyId: string;
    organismId: string;
  }) => Promise<Either<string, Candidacy>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const selectOrganismForCandidacy =
  (deps: SelectOrganismForCandidacyDeps) =>
  (params: { candidacyId: string; organismId: string }) => {
    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const updateOrganism = EitherAsync.fromPromise(() =>
      deps.updateOrganism(params)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.ORGANISM_NOT_UPDATED,
          `Erreur lors de la mise à jour de l'organisme`
        )
    );

    return checkIfCandidacyExists.chain(() => updateOrganism);
  };
