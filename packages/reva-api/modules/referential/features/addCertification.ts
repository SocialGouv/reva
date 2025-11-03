import { v4 as uuidV4 } from "uuid";

import { prismaClient } from "@/prisma/client";

import { RNCPReferential } from "../rncp/referential";
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
  const rncpTypeDiplomeCode = rncpCertification.ABREGE?.CODE;

  const label = rncpTypeDiplomeCode
    ? `${rncpTypeDiplomeCode} - ${rncpCertification.INTITULE}`
    : rncpCertification.INTITULE;

  const availableAt = new Date();

  if (!rncpCertification.DATE_FIN_ENREGISTREMENT) {
    throw new Error(
      `La certification avec le code rncp ${codeRncp} n'a pas de date de fin d'enregistrement`,
    );
  }
  const rncpExpiresAt = new Date(rncpCertification.DATE_FIN_ENREGISTREMENT);

  //generate the certification id beforehand since we need it for the firstVersionCertificationId column
  const newCertificationId = uuidV4();

  const certification = await prismaClient.certification.create({
    data: {
      id: newCertificationId,
      firstVersionCertificationId: newCertificationId,
      status: "BROUILLON",
      feasibilityFormat: "DEMATERIALIZED",
      rncpId: codeRncp,
      label,
      level,
      availableAt,
      // RNCP Fields
      rncpLabel: label,
      rncpLevel: level,
      rncpTypeDiplome: rncpCertification.ABREGE?.LIBELLE,
      rncpExpiresAt,
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
