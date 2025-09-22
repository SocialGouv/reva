import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { getAccountByKeycloakId } from "@/modules/account/features/getAccountByKeycloakId";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { createOrganism } from "../database/organisms";
import { CreateLieuAccueilInfoInput } from "../organism.types";

import { assignMaisonMereAAPToOrganism } from "./assignMaisonMereAAPToOrganism";
import { getLLToEarthFromZip } from "./getLLToEarthFromZip";
import { getMaisonMereAAPByGestionnaireAccountId } from "./getMaisonMereAAPByGestionnaireAccountId";
import { getMaisonMereOnCCNByMaisonMereId } from "./getMaisonMereOnCCNByMaisonMereId";

export const createLieuAccueilInfo = async ({
  keycloakId,
  params,
  userInfo,
}: {
  keycloakId: string;
  params: CreateLieuAccueilInfoInput;
  userInfo: AAPAuditLogUserInfo;
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
      adresseInformationsComplementaires,
      nomPublic,
      adresseNumeroEtNomDeRue,
      adresseCodePostal,
      adresseVille,
      emailContact,
      telephone,
      siteInternet,
      conformeNormesAccessibilite,
    } = params;
    const {
      typologie,
      dateExpirationCertificationQualiopi,
      statutJuridique,
      raisonSociale,
      siret,
    } = maisonMereAAP;

    const llToEarth = await getLLToEarthFromZip({
      zip: adresseCodePostal,
    });

    //organism creation
    const newOrganism = await createOrganism({
      label: raisonSociale,
      contactAdministrativeEmail: emailContact,
      contactAdministrativePhone: telephone ?? "",
      website: siteInternet ?? "",
      siret,
      legalStatus: statutJuridique,
      typology: typologie,
      qualiopiCertificateExpiresAt: dateExpirationCertificationQualiopi,
      llToEarth,
      modaliteAccompagnement: "LIEU_ACCUEIL",
      siteInternet: siteInternet ?? "",
      nomPublic,
      adresseCodePostal,
      adresseVille,
      adresseNumeroEtNomDeRue,
      adresseInformationsComplementaires:
        adresseInformationsComplementaires ?? "",
      emailContact,
      telephone,
      conformeNormesAccessibilite,
      modaliteAccompagnementRenseigneeEtValide: true,
    });

    logger.info(
      `[validateorganismData] Successfuly created organism with siret ${siret}`,
    );

    await assignMaisonMereAAPToOrganism({
      organismId: newOrganism.id,
      maisonMereAAPId: maisonMereAAP.id,
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

    await logAAPAuditEvent({
      eventType: "LIEU_ACCUEIL_CREATED",
      maisonMereAAPId: maisonMereAAP.id,
      userInfo,
      details: { organismId: newOrganism.id, organismLabel: raisonSociale },
    });

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
