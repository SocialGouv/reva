
import { Candidate } from "@prisma/client";
import { Either, EitherAsync } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetCandidateByEmailDeps {
    getCandidateByEmail: (id: string) => Promise<Either<string, Candidate>>;
}

export const getCandidateByEmail = (deps: GetCandidateByEmailDeps) => (params: { email: string; }): Promise<Either<FunctionalError, Candidate>> => 
    EitherAsync.fromPromise(() => deps.getCandidateByEmail(params.email))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDATE_NOT_FOUND, `Aucun candidat n'a été trouvée`)).run();

