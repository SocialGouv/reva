import { Either, EitherAsync } from "purify-ts";

import { Degree } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetDegreesDeps {
  getDegrees: () => Promise<Either<string, Degree[]>>;
}

export const getDegrees = (deps: GetDegreesDeps) => async () =>
  EitherAsync.fromPromise(() => deps.getDegrees()).mapLeft(
    () =>
      new FunctionalError(
        FunctionalCodeError.TECHNICAL_ERROR,
        "Erreur lors de la récupération des diplômes"
      )
  );
