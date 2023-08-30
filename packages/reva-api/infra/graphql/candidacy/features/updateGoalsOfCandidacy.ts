import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { Candidacy, Goal } from "../candidacy.types";

interface UpdateGoalsOfCandidacyDeps {
  updateGoals: (params: {
    candidacyId: string;
    goals: Goal[];
  }) => Promise<Either<string, number>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const updateGoalsOfCandidacy =
  (deps: UpdateGoalsOfCandidacyDeps) =>
  (params: { candidacyId: string; goals: Goal[] }) => {
    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const updateGoals = EitherAsync.fromPromise(() =>
      deps.updateGoals(params)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.GOALS_NOT_UPDATED,
          `Erreur lors de la mise à jour des objectifs`
        )
    );

    return checkIfCandidacyExists.chain(() => updateGoals);
  };
