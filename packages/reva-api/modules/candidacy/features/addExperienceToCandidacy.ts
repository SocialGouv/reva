import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { Candidacy, Experience, ExperienceInput } from "../candidacy.types";
import { canCandidateUpdateCandidacy } from "./canCandidateUpdateCandidacy";

interface AddExperienceToCandidacyDeps {
  createExperience: (params: {
    candidacyId: string;
    experience: ExperienceInput;
  }) => Promise<Either<string, Experience>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const addExperienceToCandidacy =
  (deps: AddExperienceToCandidacyDeps) =>
  async (params: { candidacyId: string; experience: ExperienceInput }) => {
    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId),
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`,
        ),
    );

    const createExperience = EitherAsync.fromPromise(() =>
      deps.createExperience(params),
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.EXPERIENCE_NOT_CREATED,
          `Erreur lors de la creation de l'expérience`,
        ),
    );

    if (
      !(await canCandidateUpdateCandidacy({ candidacyId: params.candidacyId }))
    ) {
      throw new Error(
        "Impossible de mettre à jour la candidature une fois le premier entretien effectué",
      );
    }

    return checkIfCandidacyExists.chain(() => createExperience);
  };
