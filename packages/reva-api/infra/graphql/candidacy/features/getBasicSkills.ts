import { Either, EitherAsync } from "purify-ts";

import { BasicSkill } from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface GetBasicSkillsDeps {
  getBasicSkills: () => Promise<Either<string, BasicSkill[]>>;
}

export const getBasicSkills =
  (deps: GetBasicSkillsDeps) =>
  async (): Promise<Either<FunctionalError, BasicSkill[]>> =>
    EitherAsync.fromPromise(() => deps.getBasicSkills()).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Erreur lors de la récupération des savoirs de base"
        )
    );
