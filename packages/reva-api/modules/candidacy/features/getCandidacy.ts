import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../domain/types/functionalError";
import { Candidacy } from "../candidacy.types";

interface GetCandidacyDeps {
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const getCandidacy =
  (deps: GetCandidacyDeps) =>
  (params: { id: string }): Promise<Either<FunctionalError, Candidacy>> =>
    EitherAsync.fromPromise(() => deps.getCandidacyFromId(params.id))
      .mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
            `Aucune candidature n'a été trouvée`
          )
      )
      .run();
