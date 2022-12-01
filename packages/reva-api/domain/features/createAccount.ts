import { Either, EitherAsync, Left, Maybe, Right, identity } from "purify-ts";

import { IAMAccount } from "../types/account";
import { Organism } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface CreateAccountDeps {
  getAccountInIAM: (params: {
    email: string;
    username: string;
  }) => Promise<Either<string, Maybe<IAMAccount>>>;
  getOrganismById: (id: string) => Promise<Either<string, Maybe<Organism>>>;
  createAccountInIAM: (params: {
    email: string;
    username: string;
    firstname?: string;
    lastname?: string;
    group: string;
  }) => Promise<Either<string, string>>;
  createAccountWithProfile: any;
}

export const createAccount =
  (deps: CreateAccountDeps) =>
  async (params: {
    email: string;
    username: string;
    firstname?: string;
    lastname?: string;
    group: string;
    organismId?: string;
  }): Promise<Either<FunctionalError, any>> => {
    if (!params.email) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.ACCOUNT_EMAIL_EMPTY,
          `Email invalide`
        )
      );
    }

    let checkIfOrganismIsValid;
    if (params.group === "admin") {
      checkIfOrganismIsValid = EitherAsync.fromPromise(async () => Right(null));
    } else if (!params.organismId) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.ACCOUNT_ORGANISMID_EMPTY,
          `L'organismId est obligatoire pour un groupe "organism"`
        )
      );
    } else {
      checkIfOrganismIsValid = EitherAsync.fromPromise(() =>
        deps.getOrganismById(params.organismId as string)
      )
        .mapLeft(
          (error) =>
            new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, error)
        )
        .chain(async (maybeOrganism: Maybe<Organism>) => {
          return maybeOrganism.toEither(
            new FunctionalError(
              FunctionalCodeError.ORGANISM_NOT_FOUND,
              `Organisme non trouvé`
            )
          );
        });
    }

    const checkIfAccountInIAMAlreadyExists = EitherAsync.fromPromise(() =>
      deps.getAccountInIAM({ email: params.email, username: params.username })
    )
      .mapLeft(
        (error) =>
          new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, error)
      )
      .chain(async (maybeAccount: Maybe<IAMAccount>) => {
        if (maybeAccount.isJust()) {
          throw new FunctionalError(
            FunctionalCodeError.ACCOUNT_ALREADY_EXISTS,
            `Un compte existe déjà pour cet email ou username`
          );
        }

        return Right(null);
      });

    const createAccountInIAM = EitherAsync.fromPromise(() =>
      deps.createAccountInIAM(params)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.ACCOUNT_IN_IAM_NOT_CREATED,
          `Erreur lors de la création du compte sur l'IAM`
        )
    );

    const createAccountWithProfile = (keycloakId: any) =>
      EitherAsync.fromPromise(() => {
        return deps.createAccountWithProfile({ ...params, keycloakId });
      }).mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.ACCOUNT_WITH_PROFILE_NOT_CREATED,
            `Erreur lors de la création du compte avec le profil`
          )
      );

    return checkIfOrganismIsValid
      .chain(() => checkIfAccountInIAMAlreadyExists)
      .chain(() => createAccountInIAM)
      .chain((id: any) => createAccountWithProfile(id));
  };
