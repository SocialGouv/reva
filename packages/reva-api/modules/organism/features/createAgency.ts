import { randomUUID } from "crypto";

import { prismaClient } from "../../../prisma/client";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { logger } from "../../shared/logger";
import { createOrganism } from "../database/organisms";
import { CreateAgencyInput } from "../organism.types";
import { assignMaisonMereAAPToOrganism } from "./assignMaisonMereAAPToOrganism";
import { createOrUpdateInformationsCommerciales } from "./createOrUpdateInformationsCommerciales";
import { getInformationsCommercialesByEmailContact } from "./getInformationsCommercialesByEmailContact";
import { getLLToEarthFromZip } from "./getLLToEarthFromZip";
import { getMaisonMereAAPByGestionnaireAccountId } from "./getMaisonMereAAPByGestionnaireAccountId";
import { getMaisonMereOnCCNByMaisonMereId } from "./getMaisonMereOnCCNByMaisonMereId";
import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";

export const createAgency = async ({
  keycloakId,
  params,
}: {
  keycloakId: string;
  params: CreateAgencyInput;
}) => {
  try {
    const account = await getAccountByKeycloakId({
      keycloakId,
    });

    if (!account) {
      throw new FunctionalError(
        FunctionalCodeError.ACCOUNT_NOT_FOUND,
        `Le compte n'existe pas avec l'ID keycloak: ${keycloakId}`,
      );
    }

    const maisonMereAAP = await getMaisonMereAAPByGestionnaireAccountId({
      gestionnaireAccountId: account.id,
    });

    if (!maisonMereAAP) {
      throw new FunctionalError(
        FunctionalCodeError.MAISON_MERE_AAP_NOT_FOUND,
        `La maison mère AAP n'existe pas`,
      );
    }
    const {
      contactAdministrativeEmail,
      contactAdministrativePhone,
      adresseInformationsComplementaires,
      website,
      nom,
      domaineIds,
      degreeIds,
    } = params;
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
        `Un organisme existe déjà avec l'email de contacte ${contactAdministrativeEmail}`,
      );
    }
    const llToEarth = await getLLToEarthFromZip({
      zip: params.zip,
    });

    //organism creation
    const newOrganism = await createOrganism({
      label: raisonSociale,
      contactAdministrativeEmail,
      contactAdministrativePhone: contactAdministrativePhone ?? "",
      website: siteWeb ?? "",
      siret,
      legalStatus: statutJuridique,
      isActive: true,
      typology: typologie,
      qualiopiCertificateExpiresAt: dateExpirationCertificationQualiopi,
      llToEarth,
      isOnSite: true,
      domaineIds,
      degreeIds,
    });

    logger.info(
      `[validateorganismData] Successfuly created organism with siret ${siret}`,
    );

    await assignMaisonMereAAPToOrganism({
      organismId: newOrganism.id,
      maisonMereAAPId: maisonMereAAP.id,
      isActive: maisonMereAAP.isActive,
    });

    await createOrUpdateInformationsCommerciales({
      informationsCommerciales: {
        organismId: newOrganism.id,
        siteInternet: website ?? "",
        nom: nom ?? "",
        adresseCodePostal: params.zip,
        adresseVille: params.city,
        adresseNumeroEtNomDeRue: params.address,
        adresseInformationsComplementaires:
          adresseInformationsComplementaires ?? "",
        emailContact: params.contactAdministrativeEmail,
        telephone: params.contactAdministrativePhone ?? "",
        conformeNormesAccessbilite: params.conformeNormesAccessbilite,
        id: randomUUID(),
      },
    });

    if (
      typologie === "expertBrancheEtFiliere" ||
      typologie === "expertBranche"
    ) {
      const maisonMereOnConventionCollective =
        await getMaisonMereOnCCNByMaisonMereId({
          maisonMereAAPId: maisonMereAAP.id,
        });
      await prismaClient.organismOnConventionCollective.createMany({
        data: maisonMereOnConventionCollective.map((maisonMere) => ({
          ccnId: maisonMere.ccnId,
          organismId: newOrganism.id,
        })),
      });
    }

    logger.info(
      `[validateorganismData] Successfuly created AP with organismId ${newOrganism.id}`,
    );

    return "Ok";
  } catch (e) {
    if (e instanceof FunctionalError) {
      throw new Error(e.message);
    } else {
      throw e;
    }
  }
};
