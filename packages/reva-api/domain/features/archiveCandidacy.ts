import { Either, EitherAsync } from "purify-ts";
import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface ArchiveCandidacyDeps {
    updateCandidacyStatus: (params: {
        candidacyId: string;
        status: "ARCHIVE";
    }) => Promise<Either<string, Candidacy>>;
}

export const archiveCandidacy = (deps: ArchiveCandidacyDeps) => (params: {
    candidacyId: string;
}) => {
    const result = EitherAsync.fromPromise(() => deps.updateCandidacyStatus({
        candidacyId: params.candidacyId,
        status: "ARCHIVE"
    }))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACIES_NOT_ARCHIVED, `Erreur lors de l'archivage de la candidature ${params.candidacyId}`));
    
    return result;
};