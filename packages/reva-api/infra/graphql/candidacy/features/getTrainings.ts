import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface Training {
  id: string;
  label: string;
}

interface GetTrainingsDeps {
  getTrainings: () => Promise<Either<string, Training[]>>;
}

export const getTrainings =
  (deps: GetTrainingsDeps) =>
  async (): Promise<Either<FunctionalError, Training[]>> =>
    EitherAsync.fromPromise(() => deps.getTrainings()).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Erreur lors de la récupération des accompagnants"
        )
    );
