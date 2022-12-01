import { Either, EitherAsync, Right } from "purify-ts";

import { CandidacySummary } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetCandidacySummariesDeps {
  hasRole: (role: string) => boolean;
  getCandidacySummaries: () => Promise<Either<string, CandidacySummary[]>>;
  getCandidacySummariesForUser: (
    IAMId: string
  ) => Promise<Either<string, CandidacySummary[]>>;
}

export const getCandidacySummaries =
  (deps: GetCandidacySummariesDeps) => (params: { IAMId: string }) => {
    if (deps.hasRole("admin")) {
      return EitherAsync.fromPromise(() =>
        deps.getCandidacySummaries()
      ).mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.CANDIDACIES_NOT_FOUND,
            `Erreur lors de la récupération des aperçues candidatures`
          )
      );
    } else if (deps.hasRole("manage_candidacy")) {
      return EitherAsync.fromPromise(() =>
        deps.getCandidacySummariesForUser(params.IAMId)
      ).mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.CANDIDACIES_NOT_FOUND,
            `Erreur lors de la récupération des aperçues candidatures`
          )
      );
    } else {
      return Right([]);
    }
  };
