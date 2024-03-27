import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { Candidacy } from "../candidacy.types";
import { canCandidateUpdateCandidacy } from "./canCandidateUpdateCandidacy";

interface UpdateGoalsOfCandidacyDeps {
  updateGoals: (params: {
    candidacyId: string;
    goals: [];
  }) => Promise<Either<string, number>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const updateGoalsOfCandidacy =
  (deps: UpdateGoalsOfCandidacyDeps) =>
  async (params: { candidacyId: string; goals: [] }) => {
    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId),
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`,
        ),
    );

    const updateGoals = EitherAsync.fromPromise(() =>
      deps.updateGoals(params),
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.GOALS_NOT_UPDATED,
          `Erreur lors de la mise à jour des objectifs`,
        ),
    );

    if (
      !(await canCandidateUpdateCandidacy({ candidacyId: params.candidacyId }))
    ) {
      throw new Error(
        "Impossible de mettre à jour la candidature une fois le premier entretien effetué",
      );
    }

    return checkIfCandidacyExists.chain(() => updateGoals);
  };
