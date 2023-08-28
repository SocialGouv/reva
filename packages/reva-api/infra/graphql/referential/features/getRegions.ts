import { Either, EitherAsync } from "purify-ts";

import { Region } from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

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
