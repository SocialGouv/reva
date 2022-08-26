import { Either, EitherAsync } from "purify-ts";
import { Organism } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetOrganismsDeps {
    getOrganisms: (params: {candidacyId: string}) => Promise<Either<string, Organism[]>>;
}

export const getOrganismsForCandidacy = (deps: GetOrganismsDeps) => (params: {
    candidacyId: string;
}) => {
    const candidacies = EitherAsync.fromPromise(() => deps.getOrganisms(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.ORGANISMS_NOT_FOUND, `Erreur lors de la récupération des organismes de la candidature`));
    return candidacies;
};