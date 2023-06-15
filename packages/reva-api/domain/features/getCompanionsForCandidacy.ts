import { Either, EitherAsync } from "purify-ts";

import { Organism } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetCompanionsForCandidacyDeps {
  getCompanionsForCandidacy: (params: {
    candidacyId: string;
  }) => Promise<Either<string, Organism[]>>;
}

export const getCompanionsForCandidacy =
  (deps: GetCompanionsForCandidacyDeps) =>
  (params: { candidacyId: string }) => {
    return EitherAsync.fromPromise(() =>
      deps.getCompanionsForCandidacy(params)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Erreur lors de la récupération des accompagnateurs"
        )
    );
  };
