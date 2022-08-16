import { Either, EitherAsync } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";


interface CreateAccountDeps {
    getAccountInIAMFromEmail: any;
    createAccountInIAM: any;
    createAccountWithProfile: any;
}

export const createAccount = (deps: CreateAccountDeps) => async (params: any): Promise<Either<FunctionalError, any>> => {
    const checkIfAccountInIAMAlreadyExists = 
        EitherAsync.fromPromise(() => deps.getAccountInIAMFromEmail(params.deviceId))
            .swap()
            .mapLeft(() => new FunctionalError(FunctionalCodeError.ACCOUNT_ALREADY_EXISTS, `Un compte existe déjà pour cet email`));

    const createAccountInIAM = EitherAsync.fromPromise(() => deps.createAccountInIAM(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.ACCOUNT_IN_IAM_NOT_CREATED, `Erreur lors de la création du compte sur l'IAM`));


    const createAccountWithProfile = EitherAsync.fromPromise(() => deps.createAccountWithProfile(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.ACCOUNT_WITH_PROFILE_NOT_CREATED, `Erreur lors de la création du compte avec le profil`));

    return checkIfAccountInIAMAlreadyExists
        .chain(() => createAccountInIAM)
        .chain(() => createAccountWithProfile);
};