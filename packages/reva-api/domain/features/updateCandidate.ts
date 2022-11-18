import { Candidate } from "@prisma/client";
import { Either, EitherAsync } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface UpdateCandidate {
    updateCandidate: (candidate: Candidate) => Promise<Either<string, Candidate>>;
};

export const updateCandidate = (deps: UpdateCandidate) => (candidate: Candidate) => 
    EitherAsync.fromPromise(() => deps.updateCandidate(candidate))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDATE_NOT_SAVED, `Erreur lors de l'enregistrement du candidat ${candidate.email}`));
