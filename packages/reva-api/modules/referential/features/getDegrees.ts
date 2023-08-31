import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { Degree } from "../referential.types";

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
