import { Candidate } from "@prisma/client";
import { Either, EitherAsync, Right } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface UpdateCandidate {
    hasRole: (role: string) => boolean;
    updateCandidate: (candidate: Candidate) => Promise<Either<string, Candidate>>;
};

export const updateCandidate = (deps: UpdateCandidate) => (candidate: Candidate) => {
    if (deps.hasRole("admin") || deps.hasRole("manage_candidacy")) {
        return EitherAsync.fromPromise(() => deps.updateCandidate(candidate))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDATE_NOT_SAVED, `Erreur lors de l'enregistrement du candidat ${candidate.email}`));
    } else {
        return Right([]);
    }
}