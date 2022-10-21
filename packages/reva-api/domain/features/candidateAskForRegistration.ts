import { Either, EitherAsync, Right } from "purify-ts";
import { CandidateRegistrationInput } from "../types/candidate";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface CandidateInput {
    email: string;
    phone: string;
    firstname: string;
    lastname: string;
}

interface AskForRegistrationDeps {
    generateJWTForRegistration: (params: CandidateRegistrationInput) => Promise<Either<string, string>>;
    sendRegistrationEmail: (params: { email: string; token: string; }) => Promise<Either<string, string>>;
}

export const askForRegistration = (deps: AskForRegistrationDeps) => async (params: CandidateInput) => {

    const generateJWTForRegistration = EitherAsync.fromPromise(() => deps.generateJWTForRegistration({...params, action: "registration"}))
        .mapLeft(error => new FunctionalError(FunctionalCodeError.CANDIDATE_JWT_GENERATION_ERROR, error));

    const sendRegistrationEmail = (params: { email: string; token: string; }) => 
        EitherAsync.fromPromise(() => deps.sendRegistrationEmail(params))
        .mapLeft(error => new FunctionalError(FunctionalCodeError.CANDIDATE_REGISTRATION_EMAIL_ERROR, error));

    return generateJWTForRegistration
        .chain((token: string) => sendRegistrationEmail({ email: params.email, token }));
}