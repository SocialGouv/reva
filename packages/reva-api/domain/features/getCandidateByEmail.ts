import { Candidate } from "@prisma/client";
import { Either, EitherAsync, Right } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetCandidateByEmailDeps {
    hasRole: (role: string) => boolean;
    getCandidateByEmail: (id: string) => Promise<Either<string, Candidate>>;
}

export const getCandidateByEmail = (deps: GetCandidateByEmailDeps) => (params: { email: string; }) => {
    if (deps.hasRole("admin") || deps.hasRole("manage_candidacy")) {
        return EitherAsync.fromPromise(() => deps.getCandidateByEmail(params.email))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDATE_NOT_FOUND, `Aucun candidat n'a été trouvée`));
    } else {
        return Right([]);
    }
}