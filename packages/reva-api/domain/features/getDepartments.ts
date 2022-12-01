import { Either, EitherAsync } from "purify-ts";

import { Department } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

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
