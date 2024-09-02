import { randomUUID } from "crypto";

import { prismaClient } from "../../../prisma/client";
import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { logger } from "../../shared/logger";
import { createOrganism } from "../database/organisms";
import { CreateAgencyInfoInput } from "../organism.types";
import { assignMaisonMereAAPToOrganism } from "./assignMaisonMereAAPToOrganism";
import { createOrUpdateInformationsCommerciales } from "./createOrUpdateInformationsCommerciales";
import { getLLToEarthFromZip } from "./getLLToEarthFromZip";
import { getMaisonMereAAPByGestionnaireAccountId } from "./getMaisonMereAAPByGestionnaireAccountId";
import { getMaisonMereOnCCNByMaisonMereId } from "./getMaisonMereOnCCNByMaisonMereId";

export const createAgencyInfo = async ({
  keycloakId,
  params,
}: {
  keycloakId: string;
  params: CreateAgencyInfoInput;
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
    } = params;
    const {
      typologie,
      dateExpirationCertificationQualiopi,
      statutJuridique,
      raisonSociale,
      siret,
      siteWeb,
    } = maisonMereAAP;

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
    });

    logger.info(
      `[validateorganismData] Successfuly created organism with siret ${siret}`,
    );

    await assignMaisonMereAAPToOrganism({
      organismId: newOrganism.id,
      maisonMereAAPId: maisonMereAAP.id,
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
        conformeNormesAccessbilite: params.conformeNormesAccessibilite,
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
