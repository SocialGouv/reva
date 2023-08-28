import { Either, EitherAsync } from "purify-ts";

import {
  Candidacy,
  Experience,
  ExperienceInput,
} from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface AddExperienceToCandidacyDeps {
  createExperience: (params: {
    candidacyId: string;
    experience: ExperienceInput;
  }) => Promise<Either<string, Experience>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const addExperienceToCandidacy =
  (deps: AddExperienceToCandidacyDeps) =>
  (params: { candidacyId: string; experience: ExperienceInput }) => {
    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const createExperience = EitherAsync.fromPromise(() =>
      deps.createExperience(params)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.EXPERIENCE_NOT_CREATED,
          `Erreur lors de la creation de l'expérience`
        )
    );

    return checkIfCandidacyExists.chain(() => createExperience);
  };
