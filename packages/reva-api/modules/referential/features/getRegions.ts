import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { Region } from "../referential.types";

interface GetRegionsDeps {
  getRegions: () => Promise<Either<string, Region[]>>;
}

export const getRegions = (deps: GetRegionsDeps) => async () =>
  EitherAsync.fromPromise(() => deps.getRegions()).mapLeft(
    () =>
      new FunctionalError(
        FunctionalCodeError.TECHNICAL_ERROR,
        "Erreur lors de la récupération des regions"
      )
  );
