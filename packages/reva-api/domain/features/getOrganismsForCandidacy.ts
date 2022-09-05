import { Either, EitherAsync } from "purify-ts";
import { Organism } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetOrganismsDeps {
    getAAPOrganisms: (params: {candidacyId: string}) => Promise<Either<string, Organism[]>>;
}

export const getAAPOrganismsForCandidacy = (deps: GetOrganismsDeps) => (params: {
    candidacyId: string;
}) => {
    const candidacies = EitherAsync.fromPromise(() => deps.getAAPOrganisms(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.AAP_ORGANISMS_NOT_FOUND, `Erreur lors de la récupération des organismes AAP de la candidature`));
    return candidacies;
};