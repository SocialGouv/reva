import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../domain/types/functionalError";
import { BasicSkill } from "../candidacy.types";

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
