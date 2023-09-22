import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import { getCertificationAuthorityById } from "../../feasibility/feasibility.features";
import { getOrganismById } from "../../organism/database/organisms";
import { Organism } from "../../organism/organism.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { IAMAccount } from "../account.types";
import { createAccountProfile } from "../database/accounts";
import * as IAM from "./keycloak";

export const createAccount = async (params: {
  keycloakAdmin: KeycloakAdminClient;
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
        getOrganismById(params.organismId as string)
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
          await getCertificationAuthorityById(
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
    IAM.getAccount(params.keycloakAdmin)({
      email: params.email,
      username: params.username,
    })
  )
    .mapLeft(
      (error) => new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, error)
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
    IAM.createAccount(params.keycloakAdmin)(params)
  ).mapLeft(
    () =>
      new FunctionalError(
        FunctionalCodeError.ACCOUNT_IN_IAM_NOT_CREATED,
        `Erreur lors de la création du compte sur l'IAM`
      )
  );

  const createAccountWithProfile = (keycloakId: string) =>
    EitherAsync.fromPromise(() => {
      return (createAccountProfile as any)({ ...params, keycloakId });
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
