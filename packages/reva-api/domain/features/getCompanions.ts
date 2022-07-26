import { Either, EitherAsync, Left } from "purify-ts";
import { Companion } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetCompanionsDeps {
    getCompanions: () => Promise<Either<string, Companion[]>>;
}

export const getCompanions = (deps: GetCompanionsDeps) => async () => 
    EitherAsync.fromPromise(() => deps.getCompanions())
        .mapLeft(() => Left(new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, 'Erreur lors de la récupération des accompagnants'))).run();
