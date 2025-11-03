import { prismaClient } from "@/prisma/client";

import { RNCPReferential } from "../rncp/referential";
import { getLevelFromRNCPCertification } from "../utils/rncp.helpers";

import { getSubdomains } from "./getDomainsByFormacodes";
import { getFormacodes } from "./getFormacodes";

export const updateCertificationWithRncpFieldsAndSubDomains = async (params: {
  id: string;
}) => {
  const { id } = params;

  const certification = await prismaClient.certification.findUnique({
    where: { id },
  });
  if (!certification) {
    throw new Error(`La certification avec l'id ${id} n'existe pas`);
  }

  const codeRncp = certification.rncpId;

  const rncpCertification =
    await RNCPReferential.getInstance().findOneByRncp(codeRncp);
  if (!rncpCertification) {
    throw new Error(
      `La certification avec le code rncp ${codeRncp} n'existe pas dans le référentiel RNCP`,
    );
  }

  if (!rncpCertification.DATE_FIN_ENREGISTREMENT) {
    throw new Error(
      `La certification avec le code rncp ${codeRncp} n'a pas de date de fin d'enregistrement`,
    );
  }

  // Update certification from based on RNCP
  await prismaClient.certification.update({
    where: { id: certification.id },
    data: {
      rncpLabel: rncpCertification.INTITULE,
      rncpLevel: getLevelFromRNCPCertification(rncpCertification),
      rncpTypeDiplome: rncpCertification.ABREGE?.LIBELLE,
      rncpExpiresAt: new Date(rncpCertification.DATE_FIN_ENREGISTREMENT),
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
    },
  });

  // Link certification to sub domains
  const referential = await getFormacodes();

  const subDomains = getSubdomains(rncpCertification.FORMACODES, referential);

  // Remove all links by certificationId
  await prismaClient.certificationOnFormacode.deleteMany({
    where: { certificationId: certification.id },
  });

  // Create all links
  await prismaClient.certificationOnFormacode.createMany({
    data: subDomains.map((subDomain) => ({
      formacodeId: subDomain.id,
      certificationId: certification.id,
      isMain: subDomain.isMain,
    })),
  });
};
