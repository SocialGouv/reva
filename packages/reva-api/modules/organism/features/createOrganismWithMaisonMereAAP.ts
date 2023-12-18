import { randomUUID } from "crypto";

import KeycloakAdminClient from "@keycloak/keycloak-admin-client";

import { createAccountProfile } from "../../account/database/accounts";
import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";
import * as IAM from "../../account/features/keycloak";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { logger } from "../../shared/logger";
import { createOrganism } from "../database/organisms";
import { CreateOrUpdateOrganismWithMaisonMereAAPDataRequest } from "../organism.types";
import { assignMaisonMereAAPToOrganism } from "./assignMaisonMereAAPToOrganism";
import { createOrUpdateInformationsCommerciales } from "./createOrUpdateInformationsCommerciales";
import { getInformationsCommercialesByEmailContact } from "./getInformationsCommercialesByEmailContact";
import { getMaisonMereAAPByGestionnaireAccountId } from "./getMaisonMereAAPByGestionnaireAccountId";

interface CreateOrganismWithMaisonMereAAPRequestParams {
  organismData: CreateOrUpdateOrganismWithMaisonMereAAPDataRequest;
}

export const createOrganismWithMaisonMereAAP = async ({
  keycloakAdmin,
  keycloakId,
  params,
}: {
  keycloakAdmin: KeycloakAdminClient;
  keycloakId: string;
  params: CreateOrganismWithMaisonMereAAPRequestParams;
}) => {
  const { organismData } = params;
  const getIamAccount = IAM.getAccount(keycloakAdmin);
  const createAccountInIAM = IAM.createAccount(keycloakAdmin);

  try {
    const accountExist = (
      await getIamAccount({
        email: organismData.email,
        username: "",
      })
    )
      .unsafeCoerce()
      .extractNullable();

    if (accountExist) {
      throw new FunctionalError(
        FunctionalCodeError.ACCOUNT_ALREADY_EXISTS,
        `Un compte IAM existe déjà pour l'email ${organismData.email}`
      );
    }

    const account = await getAccountByKeycloakId({
      keycloakId,
    });

    if (!account) {
      throw new FunctionalError(
        FunctionalCodeError.ACCOUNT_NOT_FOUND,
        `Le compte n'existe pas avec l'ID keycloak: ${keycloakId}`
      );
    }

    const maisonMereAAP = await getMaisonMereAAPByGestionnaireAccountId({
      gestionnaireAccountId: account.id,
    });

    if (!maisonMereAAP) {
      throw new FunctionalError(
        FunctionalCodeError.MAISON_MERE_AAP_NOT_FOUND,
        `La maison mère AAP n'existe pas`
      );
    }
    const {
      firstname,
      lastname,
      email,
      contactAdministrativeEmail,
      contactAdministrativePhone,
      departmentsWithOrganismMethods,
      adresseInformationsComplementaires,
      website,
      nom,
    } = organismData;
    const {
      typologie,
      dateExpirationCertificationQualiopi,
      statutJuridique,
      raisonSociale,
      siret,
      siteWeb,
    } = maisonMereAAP;

    const organismInfoCommercialesWithEmailContactAlreadyExist =
      await getInformationsCommercialesByEmailContact({
        emailContact: contactAdministrativeEmail,
      });

    if (organismInfoCommercialesWithEmailContactAlreadyExist.length > 0) {
      throw new FunctionalError(
        FunctionalCodeError.ORGANISM_ALREADY_EXISTS,
        `Un organisme existe déjà avec l'email de contacte ${contactAdministrativeEmail}`
      );
    }

    //organism creation
    const newOrganism = (
      await createOrganism({
        label: raisonSociale,
        address: maisonMereAAP.adresse,
        contactAdministrativeEmail,
        contactAdministrativePhone: contactAdministrativePhone ?? "",
        website: siteWeb ?? "",
        city: maisonMereAAP.ville,
        zip: maisonMereAAP.codePostal,
        siret,
        legalStatus: statutJuridique,
        isActive: true,
        typology: typologie,
        departmentsWithOrganismMethods,
        qualiopiCertificateExpiresAt: dateExpirationCertificationQualiopi,
      })
    ).unsafeCoerce();

    logger.info(
      `[validateorganismData] Successfuly created organism with siret ${siret}`
    );

    await createOrUpdateInformationsCommerciales({
      informationsCommerciales: {
        organismId: newOrganism.id,
        siteInternet: website ?? "",
        nom: nom ?? "",
        adresseCodePostal: organismData.zip,
        adresseVille: organismData.city,
        adresseNumeroEtNomDeRue: organismData.address,
        adresseInformationsComplementaires:
          adresseInformationsComplementaires ?? "",
        emailContact: organismData.contactAdministrativeEmail,
        telephone: organismData.contactAdministrativePhone ?? "",
        conformeNormesAccessbilite: organismData.conformeNormesAccessbilite,
        id: randomUUID(),
      },
    });

    //iam account creation
    const newKeycloakId = (
      await createAccountInIAM({
        email,
        firstname,
        lastname,
        username: email,
        group: "organism",
      })
    ).unsafeCoerce();

    logger.info(
      `[validateorganismData] Successfuly created IAM account ${newKeycloakId}`
    );

    //db account creation
    await createAccountProfile({
      firstname: organismData.firstname,
      lastname: organismData.lastname,
      email: organismData.email,
      keycloakId: newKeycloakId,
      organismId: newOrganism.id,
    });

    logger.info(
      `[validateorganismData] Successfuly created AP with organismId ${newOrganism.id}`
    );

    await assignMaisonMereAAPToOrganism({
      organismId: newOrganism.id,
      maisonMereAAPId: maisonMereAAP.id,
    });

    return "Ok";
  } catch (e) {
    if (e instanceof FunctionalError) {
      throw e;
    } else {
      logger.error(e);
      throw new FunctionalError(
        FunctionalCodeError.TECHNICAL_ERROR,
        "Erreur pendant la création de l'organisme"
      );
    }
  }
};
