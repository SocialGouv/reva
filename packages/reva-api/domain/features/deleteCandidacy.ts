import { Either, EitherAsync } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface DeleteCandidacyDeps {
    deleteCandidacyFromId: (
        candidacyId: string
    ) => Promise<Either<string, string>>;
}

export const deleteCandidacy = (deps: DeleteCandidacyDeps) => (params: {
    candidacyId: string;
}) => {
    const result = EitherAsync.fromPromise(() => deps.deleteCandidacyFromId(params.candidacyId))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACIES_NOT_DELETED, `Erreur lors de la suppression de la candidature ${params.candidacyId}`));
    return result;
};