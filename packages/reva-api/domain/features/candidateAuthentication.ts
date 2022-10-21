import { Either, EitherAsync, Maybe, Right } from "purify-ts";
import { IAMAccount } from "../types/account";
import { Candidate, CandidateAuthenticationInput, CandidateRegistrationInput } from "../types/candidate";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface ConfirmRegistrationDeps {
    extractCandidateFromToken: (token: string) => Promise<Either<string, CandidateAuthenticationInput>>;
    getCandidateIdFromIAM: (email: string) => Promise<Either<string, Maybe<IAMAccount>>>;
    createCandidateInIAM: (params: { 
        email: string,
        firstname: string;
        lastname: string;
    }) => Promise<Either<string, string>>;
    createCandidateWithCandidacy: any;

    generateIAMToken: (id: string) => any;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CandidateAuthenticationDeps extends ConfirmRegistrationDeps {}

export const candidateAuthentication = (deps: CandidateAuthenticationDeps) => async (params: any) => {
    return EitherAsync.fromPromise(() => deps.extractCandidateFromToken(params.token))
        .mapLeft(error => new FunctionalError(FunctionalCodeError.CANDIDATE_INVALID_TOKEN, error))
        .chain(async (candidateAuthenticationInput: CandidateAuthenticationInput) => {
            if (candidateAuthenticationInput.action === "registration") {
                return confirmRegistration(deps)({ candidate: candidateAuthenticationInput })
            } else if (candidateAuthenticationInput.action === "login") {
                // TODO
                return Right({})
            } else {
                throw new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, `Action non reconnue`);
            }
        });
}

const confirmRegistration = (deps: ConfirmRegistrationDeps) => async (params: { candidate: CandidateRegistrationInput; }) => {
    const maybeCandidateInIAM = EitherAsync.fromPromise(() => deps.getCandidateIdFromIAM(params.candidate.email))
        .mapLeft(error => new FunctionalError(FunctionalCodeError.ACCOUNT_IN_IAM_NOT_FOUND, error))
        .chain(async (maybeAccount: Maybe<IAMAccount>) => {
            if (maybeAccount.isJust()) {
                throw new FunctionalError(FunctionalCodeError.ACCOUNT_ALREADY_EXISTS, `Un compte candidat existe déjà pour cet email`);
            }

            return Right(params.candidate);
        });

    const createCandidateInIAM = (candidate: Candidate) => EitherAsync.fromPromise(() => deps.createCandidateInIAM({
        email: candidate.email,
        firstname: candidate.firstname,
        lastname: candidate.lastname,
    }))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.ACCOUNT_IN_IAM_NOT_CREATED, `Erreur lors de la création du compte sur l'IAM`))
        .map((keycloakId: string) => {
            return { ...candidate, keycloakId };
        });

    const createCandidateWithCandidacy = (candidate: Candidate & { keycloakId: string; }) => EitherAsync.fromPromise(() => {
        return deps.createCandidateWithCandidacy(candidate);
    })
        .mapLeft(() => new FunctionalError(FunctionalCodeError.ACCOUNT_WITH_PROFILE_NOT_CREATED, `Erreur lors de la création du compte avec le profil`));


    const generateIAMToken = (candidate: any) => EitherAsync.fromPromise(async () => {
        return (await deps.generateIAMToken(candidate.keycloakId))
            .map((token: string) => ({
                            token,
                            candidate: {...candidate, candidacy: candidate.candidacies[0]}
                        }));
    })
        .mapLeft(() => new FunctionalError(FunctionalCodeError.IAM_TOKEN_NOT_GENERATED, `Erreur lors de la génération de l'access token`));

    return maybeCandidateInIAM
        .chain(createCandidateInIAM)
        .chain(createCandidateWithCandidacy)
        .chain(generateIAMToken);
}



