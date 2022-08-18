import { Either, EitherAsync, Left } from "purify-ts";
import {  Region } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetRegionsDeps {
    getRegions: () => Promise<Either<string, Region[]>>;
}

export const getRegions = (deps: GetRegionsDeps) => async () => 
    EitherAsync.fromPromise(() => deps.getRegions())
        .mapLeft(() => new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, 'Erreur lors de la récupération des regions'));
