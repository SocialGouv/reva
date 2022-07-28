import { Either, EitherAsync } from "purify-ts";
import { CandidacySummary } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetCandidacySummariesDeps {
    getCandidacySummaries: () => Promise<Either<string, CandidacySummary[]>>;
}

export const getCandidacySummaries = (deps: GetCandidacySummariesDeps) => (params: {
    role: string;
}) => {
    const candidacies = EitherAsync.fromPromise(() => deps.getCandidacySummaries())
        .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACIES_NOT_FOUND, `Erreur lors de la récupération des aperçues candidatures`));
    return candidacies;
};