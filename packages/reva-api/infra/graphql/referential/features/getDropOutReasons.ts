import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { DropOutReason } from "../referential.types";

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
