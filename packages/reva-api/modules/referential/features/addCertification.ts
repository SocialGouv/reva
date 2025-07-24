import { prismaClient } from "@/prisma/client";

import { RNCPReferential } from "../rncp";
import { getLevelFromRNCPCertification } from "../utils/rncp.helpers";

import { createCompetenceBlocsFromRncp } from "./createCompetenceBlocsFromRncp";
import { getSubdomains } from "./getDomainsByFormacodes";
import { getFormacodes } from "./getFormacodes";

export const addCertification = async (params: { codeRncp: string }) => {
  const { codeRncp } = params;

  const existingCertification = await prismaClient.certification.findFirst({
    where: { rncpId: codeRncp },
  });
  if (existingCertification) {
    throw new Error(
      `La certification avec le code rncp ${codeRncp} existe déjà`,
    );
  }

  const rncpCertification =
    await RNCPReferential.getInstance().findOneByRncp(codeRncp);
  if (!rncpCertification) {
    throw new Error(
      `La certification avec le code rncp ${codeRncp} n'existe pas dans le référentiel RNCP`,
    );
  }

  if (rncpCertification.FORMACODES.length == 0) {
    throw new Error(
      `La certification avec le code rncp ${codeRncp} n'est associée à aucun formacode`,
    );
  }

  const level = getLevelFromRNCPCertification(rncpCertification);
  const rncpTypeDiplomeLabel = rncpCertification.ABREGE?.LIBELLE;

  const label = rncpTypeDiplomeLabel
    ? `${rncpTypeDiplomeLabel} - ${rncpCertification.INTITULE}`
    : rncpCertification.INTITULE;

  const availableAt = new Date();

  if (!rncpCertification.DATE_FIN_ENREGISTREMENT) {
    throw new Error(
      `La certification avec le code rncp ${codeRncp} n'a pas de date de fin d'enregistrement`,
    );
  }
  const expiresAt = new Date(rncpCertification.DATE_FIN_ENREGISTREMENT);

  const certification = await prismaClient.certification.create({
    data: {
      status: "BROUILLON",
      feasibilityFormat: "DEMATERIALIZED",
      rncpId: codeRncp,
      label,
      level,
      availableAt,
      expiresAt,
      // RNCP Fields
      rncpLabel: label,
      rncpLevel: level,
      rncpTypeDiplome: rncpTypeDiplomeLabel,
      rncpExpiresAt: expiresAt,
      rncpDeliveryDeadline: rncpCertification.DATE_LIMITE_DELIVRANCE
        ? new Date(rncpCertification.DATE_LIMITE_DELIVRANCE)
        : null,
      rncpPublishedAt: rncpCertification.DATE_DE_PUBLICATION
        ? new Date(rncpCertification.DATE_DE_PUBLICATION)
        : null,
      rncpEffectiveAt: rncpCertification.DATE_EFFET
        ? new Date(rncpCertification.DATE_EFFET)
        : null,
      rncpObjectifsContexte: rncpCertification.OBJECTIFS_CONTEXTE
        ? rncpCertification.OBJECTIFS_CONTEXTE
        : null,
      fcPrerequisites: rncpCertification.PREREQUIS.LISTE_PREREQUIS,
      prerequisites: {
        createMany: {
          data: rncpCertification.PREREQUIS.PARSED_PREREQUIS.map((p, i) => ({
            label: p,
            index: i,
          })),
        },
      },
      certificationStatusHistory: { create: { status: "BROUILLON" } },
    },
  });

  // Link certification to sub domains
  const referential = await getFormacodes();

  const subDomains = getSubdomains(rncpCertification.FORMACODES, referential);

  // Create all links
  await prismaClient.certificationOnFormacode.createMany({
    data: subDomains.map((subDomain) => ({
      formacodeId: subDomain.id,
      certificationId: certification.id,
      isMain: subDomain.isMain,
    })),
  });

  // Create competence blocs from RNCP for the new certification
  await createCompetenceBlocsFromRncp({
    certificationId: certification.id,
    rncpCertification,
  });

  return certification;
};
