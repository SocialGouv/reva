import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { Candidacy, Experience, ExperienceInput } from "../candidacy.types";

interface UpdateExperienceOfCandidacyDeps {
  updateExperience: (params: {
    candidacyId: string;
    experienceId: string;
    experience: ExperienceInput;
  }) => Promise<Either<string, Experience>>;
  getExperienceFromId: (id: string) => Promise<Either<string, Experience>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const updateExperienceOfCandidacy =
  (deps: UpdateExperienceOfCandidacyDeps) =>
  (params: {
    candidacyId: string;
    experienceId: string;
    experience: ExperienceInput;
  }) => {
    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const checkIfExperienceExists = EitherAsync.fromPromise(() =>
      deps.getExperienceFromId(params.experienceId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.EXPERIENCE_DOES_NOT_EXIST,
          `Aucune expérience n'a été trouvé`
        )
    );

    const updateExperience = EitherAsync.fromPromise(() =>
      deps.updateExperience(params)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.EXPERIENCE_NOT_UPDATED,
          `Erreur lors de la mise à jour de l'expérience`
        )
    );

    return checkIfCandidacyExists
      .chain(() => checkIfExperienceExists)
      .chain(() => updateExperience);
  };
