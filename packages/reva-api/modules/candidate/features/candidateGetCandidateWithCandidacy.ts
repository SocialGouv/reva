import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { Candidate } from "../candidate.types";

interface GetCandidacyDeps {
  getCandidateWithCandidacy: (
    keycloakId: string
  ) => Promise<Either<string, Candidate>>;
}

export const getCandidateWithCandidacy =
  (deps: GetCandidacyDeps) =>
  (params: {
    keycloakId: string;
  }): Promise<Either<FunctionalError, Candidate>> =>
    EitherAsync.fromPromise(() =>
      deps.getCandidateWithCandidacy(params.keycloakId)
    )
      .map((candidate: any) => {
        return { ...candidate, candidacy: candidate.candidacies[0] };
      })
      .mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
            `Aucune candidat n'a été trouvée`
          )
      )
      .run();
