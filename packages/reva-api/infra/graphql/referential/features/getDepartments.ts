import { Either, EitherAsync } from "purify-ts";

import { Department } from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface GetDepartmentsDeps {
  getDepartments: () => Promise<Either<string, Department[]>>;
}

export const getDepartments = (deps: GetDepartmentsDeps) => async () =>
  EitherAsync.fromPromise(() => deps.getDepartments()).mapLeft(
    () =>
      new FunctionalError(
        FunctionalCodeError.TECHNICAL_ERROR,
        "Erreur lors de la récupération des départements"
      )
  );
