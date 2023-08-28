import { CertificationAuthority } from "@prisma/client";
import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import { IAMAccount } from "../../../../domain/types/account";
import { Organism } from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface CreateAccountDeps {
  getAccountInIAM: (params: {
    email: string;
    username: string;
  }) => Promise<Either<string, Maybe<IAMAccount>>>;
  getOrganismById: (id: string) => Promise<Either<string, Maybe<Organism>>>;
  getCertificationAuthorityById: (
    id: string
  ) => Promise<CertificationAuthority | null>;
  createAccountInIAM: (params: {
    email: string;
    username: string;
    firstname?: string;
    lastname?: string;
    group: KeyCloakGroup;
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
    group: KeyCloakGroup;
    organismId?: string;
    certificationAuthorityId?: string;
  }): Promise<Either<FunctionalError, any>> => {
    if (!params.email) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.ACCOUNT_EMAIL_EMPTY,
          `Email invalide`
        )
      );
    }

    let groupSpecificChecks;

    switch (params.group) {
      case "admin":
        // for admins, no specific checks
        groupSpecificChecks = EitherAsync.fromPromise(async () => Right(null));
        break;

      case "organism":
        if (!params.organismId) {
          return Left(
            new FunctionalError(
              FunctionalCodeError.ACCOUNT_ORGANISMID_EMPTY,
              `L'organismId est obligatoire pour un groupe "organism"`
            )
          );
        }
        groupSpecificChecks = EitherAsync.fromPromise(() =>
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
        break;

      case "certification_authority":
        if (!params.certificationAuthorityId) {
          return Left(
            new FunctionalError(
              FunctionalCodeError.ACCOUNT_CERTIFICATION_AUTHORITY_ID_EMPTY,
              `certificationAuthorityId est obligatoire pour un groupe "certification_authority"`
            )
          );
        }
        groupSpecificChecks = EitherAsync.fromPromise(async () => {
          const maybeCertAuth = Maybe.fromNullable(
            await deps.getCertificationAuthorityById(
              params.certificationAuthorityId as string
            )
          );
          return maybeCertAuth.isNothing()
            ? Left(
                new FunctionalError(
                  FunctionalCodeError.CERTIFICATION_AUTHORITY_NOT_FOUND,
                  `Autorité certificatrice non trouvée`
                )
              )
            : Right(null);
        });
        break;
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

    return groupSpecificChecks
      .chain(() => checkIfAccountInIAMAlreadyExists)
      .chain(() => createAccountInIAM)
      .chain((id: any) => createAccountWithProfile(id));
  };
