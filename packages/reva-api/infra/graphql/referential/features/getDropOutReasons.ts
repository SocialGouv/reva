import { Either, EitherAsync } from "purify-ts";

import { DropOutReason } from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface GetDropOutReasonsDeps {
  getDropOutReasons: () => Promise<Either<string, DropOutReason[]>>;
}

export const getDropOutReasons = (deps: GetDropOutReasonsDeps) => async () =>
  EitherAsync.fromPromise(() => deps.getDropOutReasons()).mapLeft(
    () =>
      new FunctionalError(
        FunctionalCodeError.TECHNICAL_ERROR,
        "Erreur lors de la récupération des raisons d'abandon"
      )
  );
