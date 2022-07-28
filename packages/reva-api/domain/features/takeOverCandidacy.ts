import { Either, EitherAsync, Left, Right } from "purify-ts";
import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface TakeOverCandidacyDeps {
    existsCandidacyWithActiveStatus: (params: {
        candidacyId: string;
        status: "VALIDATION";
    }) => Promise<Either<string, boolean>>;
    updateCandidacyStatus: (params: {
        candidacyId: string;
        status: "PRISE_EN_CHARGE";
    }) => Promise<Either<string, Candidacy>>;
}

export const takeOverCandidacy = (deps: TakeOverCandidacyDeps) => (params: {
    candidacyId: string;
}) => {

    const existsCandidacyInValidation = EitherAsync.fromPromise(() => deps.existsCandidacyWithActiveStatus({
        candidacyId: params.candidacyId,
        status: "VALIDATION"
    })).chain((existsCandidacy) => {
        if (!existsCandidacy) {
            return EitherAsync.liftEither(Left(`La candidature ${params.candidacyId} ne peut être prise en charge`));
        }
        return EitherAsync.liftEither(Right(existsCandidacy));
    })
        .mapLeft((error: string) => new FunctionalError(FunctionalCodeError.CANDIDACIES_NOT_TAKEN_OVER, error));


    const updateCandidacy = EitherAsync.fromPromise(() => deps.updateCandidacyStatus({
        candidacyId: params.candidacyId,
        status: "PRISE_EN_CHARGE"
    }))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACIES_NOT_TAKEN_OVER, `Erreur lors de la prise en charge de la candidature ${params.candidacyId}`));
    
    return existsCandidacyInValidation.chain(() => updateCandidacy);
};