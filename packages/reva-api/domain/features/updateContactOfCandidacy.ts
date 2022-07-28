import { Either, EitherAsync } from "purify-ts";
import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface UpdateContactOfCandidacyDeps {
    updateContact: (params: {
        candidacyId: string;
        email: string;
        phone: string;
    }) => Promise<Either<string, Candidacy>>;
    getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const updateContactOfCandidacy = (deps: UpdateContactOfCandidacyDeps) => (params: {
    candidacyId: string;
    email: string;
    phone: string;
}) => {
    // TODO Check mail format
    const checkIfCandidacyExists = 
        EitherAsync.fromPromise(() => deps.getCandidacyFromId(params.candidacyId))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST, `Aucune candidature n'a été trouvée`));

    const updateContact = EitherAsync.fromPromise(() => deps.updateContact(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.GOALS_NOT_UPDATED, `Erreur lors de la mise à jour du contact`));


    return checkIfCandidacyExists
        .chain(() => updateContact);
};