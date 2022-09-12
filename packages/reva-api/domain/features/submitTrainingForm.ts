import { Either, EitherAsync, Left } from "purify-ts";
import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface SubmitTrainingDeps {
    updateTrainingInformations: (params: {
        candidacyId: string;
        training: {
            basicSkillIds: string[];
            certificateSkills: string;
            otherTraining: string;
            individualHourCount: number;
            collectiveHourCount: number;
            additionalHourCount: number;
            validatedByCandidate: boolean;
        };
    }) => Promise<Either<string, Candidacy>>;
    hasRole: (role: string) => boolean;
    getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const submitTraining = (deps: SubmitTrainingDeps) => (params: {
    candidacyId: string;
    training: {
        basicSkillIds: string[];
        certificateSkills: string;
        otherTraining: string;
        individualHourCount: number;
        collectiveHourCount: number;
        additionalHourCount: number;
        validatedByCandidate: boolean;
    };
}) => {
    if (!deps.hasRole("manage_candidacy")) {
        return EitherAsync.liftEither(Left(`Vous n'êtes pas authorisé à traiter cette candidature.`))
            .mapLeft((error: string) => new FunctionalError(FunctionalCodeError.NOT_AUTHORIZED, error));
    }

    const checkIfCandidacyExists = 
        EitherAsync.fromPromise(() => deps.getCandidacyFromId(params.candidacyId))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST, `Aucune candidature n'a été trouvée`));

    const updateTrainingInformations = EitherAsync.fromPromise(() => deps.updateTrainingInformations(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.STATUS_NOT_UPDATED, `Erreur lors de la mise à jour du parcours candidat`));


    return checkIfCandidacyExists
        .chain(() => updateTrainingInformations);
};