import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { Account } from "@prisma/client";

import { getCertificationAuthorityById } from "../../feasibility/feasibility.features";
import { getOrganismById } from "../../organism/database/organisms";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
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
}): Promise<Account> => {
  //assertions on parameters
  if (!params.email) {
    throw new FunctionalError(
      FunctionalCodeError.ACCOUNT_EMAIL_EMPTY,
      `Email invalide`
    );
  }

  //assertions depending on user group
  switch (params.group) {
    case "admin":
      // for admins, no specific checks
      break;

    case "organism":
      if (!params.organismId) {
        throw new FunctionalError(
          FunctionalCodeError.ACCOUNT_ORGANISMID_EMPTY,
          `L'organismId est obligatoire pour un groupe "organism"`
        );
      }
      if (
        (await getOrganismById(params.organismId || ""))
          .unsafeCoerce()
          .isNothing()
      ) {
        throw new FunctionalError(
          FunctionalCodeError.ORGANISM_NOT_FOUND,
          `Organisme non trouvé`
        );
      }
      break;

    case "certification_authority":
      if (!params.certificationAuthorityId) {
        throw new FunctionalError(
          FunctionalCodeError.ACCOUNT_CERTIFICATION_AUTHORITY_ID_EMPTY,
          `certificationAuthorityId est obligatoire pour un groupe "certification_authority"`
        );
      }
      if (
        (await getCertificationAuthorityById(
          params.certificationAuthorityId || ""
        )) == null
      ) {
        throw new FunctionalError(
          FunctionalCodeError.CERTIFICATION_AUTHORITY_NOT_FOUND,
          `Autorité certificatrice non trouvée`
        );
      }
      break;
  }

  //check if account already exist in keycloak and throw an error if that's the case.
  const maybeExistingAccount = (
    await IAM.getAccount(params.keycloakAdmin)({
      email: params.email,
      username: params.username,
    })
  ).unsafeCoerce();

  if (maybeExistingAccount.isJust()) {
    throw new FunctionalError(
      FunctionalCodeError.ACCOUNT_ALREADY_EXISTS,
      `Un compte existe déjà pour cet email ou username`
    );
  }

  // create the account in keycloak
  const keycloakId = (
    await IAM.createAccount(params.keycloakAdmin)(params)
  ).unsafeCoerce();

  //create and return the account in database
  return (
    await createAccountProfile({
      ...params,
      firstname: params.firstname || "",
      lastname: params.lastname || "",
      keycloakId,
    })
  ).unsafeCoerce();
};
