import { Either, EitherAsync } from "purify-ts";
import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface UpdateCertificationOfCandidacyDeps {
    updateCertification: (params: {
        candidacyId: string;
        certificationId: string;
    }) => Promise<Either<string, Candidacy>>;
    getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const updateCertificationOfCandidacy = (deps: UpdateCertificationOfCandidacyDeps) => (params: {
    candidacyId: string;
    certificationId: string;
}) => {
    // TODO Check mail format
    const checkIfCandidacyExists = 
        EitherAsync.fromPromise(() => deps.getCandidacyFromId(params.candidacyId))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST, `Aucune candidature n'a été trouvée`));

    const updateCertification = EitherAsync.fromPromise(() => deps.updateCertification(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.GOALS_NOT_UPDATED, `Erreur lors de la mise à jour de la certification`));


    return checkIfCandidacyExists
        .chain(() => updateCertification);
};