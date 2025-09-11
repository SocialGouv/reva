import { Account } from "@prisma/client";

import { getCertificationAuthorityById } from "@/modules/feasibility/feasibility.features";
import { getOrganismById } from "@/modules/organism/database/organisms";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { prismaClient } from "@/prisma/client";

import * as IAM from "./keycloak";

export const createAccount = async (params: {
  email: string;
  username: string;
  firstname?: string;
  lastname?: string;
  group: KeyCloakGroup;
  organismId?: string;
  certificationAuthorityId?: string;
  maisonMereAAPRaisonSociale?: string;
  dontSendKeycloakEmail?: boolean;
}): Promise<Account> => {
  // On n'envoie pas d'email de définition de mot de passe si le flag dontSendKeycloakEmail est positionné ou si l'envitonnement est sandbox
  // Les comptes créés dans l'environnement de sandbox sont destinés à une utilisation via API
  // et ne doivent pas recevoir de mail de création de mot de passe
  const dontSendKeycloakEmail =
    params.dontSendKeycloakEmail || process.env.APP_ENV === "sandbox";

  //assertions on parameters
  if (!params.email) {
    throw new FunctionalError(
      FunctionalCodeError.ACCOUNT_EMAIL_EMPTY,
      `Email invalide`,
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
          `L'organismId est obligatoire pour un groupe "organism"`,
        );
      }
      if (!(await getOrganismById(params.organismId || ""))) {
        throw new FunctionalError(
          FunctionalCodeError.ORGANISM_NOT_FOUND,
          `Organisme non trouvé`,
        );
      }
      break;

    case "certification_authority":
      if (!params.certificationAuthorityId) {
        throw new FunctionalError(
          FunctionalCodeError.ACCOUNT_CERTIFICATION_AUTHORITY_ID_EMPTY,
          `certificationAuthorityId est obligatoire pour un groupe "certification_authority"`,
        );
      }
      if (
        (await getCertificationAuthorityById(
          params.certificationAuthorityId || "",
        )) == null
      ) {
        throw new FunctionalError(
          FunctionalCodeError.CERTIFICATION_AUTHORITY_NOT_FOUND,
          `Autorité certificatrice non trouvée`,
        );
      }
      break;
  }

  //check if account already exist in keycloak and throw an error if that's the case.
  const maybeExistingAccount = await IAM.getAccount({
    email: params.email,
    username: params.username,
  });

  if (maybeExistingAccount) {
    throw new FunctionalError(
      FunctionalCodeError.ACCOUNT_ALREADY_EXISTS,
      `Un compte existe déjà pour cet email`,
    );
  }

  // create the account in keycloak
  const keycloakId = await IAM.createAccount({
    ...params,
    dontSendKeycloakEmail,
  });

  //create and return the account in database
  return prismaClient.account.create({
    data: {
      keycloakId: keycloakId,
      email: params.email,
      firstname: params.firstname,
      lastname: params.lastname,
      organismId: params.organismId,
      certificationAuthorityId: params.certificationAuthorityId,
    },
  });
};
