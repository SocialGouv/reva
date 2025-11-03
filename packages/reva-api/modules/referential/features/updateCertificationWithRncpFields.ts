import { prismaClient } from "@/prisma/client";

import { RNCPReferential } from "../rncp/referential";
import { getLevelFromRNCPCertification } from "../utils/rncp.helpers";

export const updateCertificationWithRncpFields = async (params: {
  codeRncp: string;
}) => {
  const { codeRncp } = params;

  const certification = await prismaClient.certification.findFirst({
    where: { rncpId: codeRncp },
  });
  if (!certification) {
    throw new Error(
      `La certification avec le code rncp ${codeRncp} n'existe pas`,
    );
  }

  const rncpCertification =
    await RNCPReferential.getInstance().findOneByRncp(codeRncp);
  if (!rncpCertification) {
    throw new Error(
      `La certification avec le code rncp ${codeRncp} n'existe pas dans le référentiel RNCP`,
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

  // Update certification from based on RNCP
  await prismaClient.certification.update({
    where: { id: certification.id },
    data: {
      label,
      level,
      availableAt,
      // RNCP Fields
      rncpLabel: rncpCertification.INTITULE,
      rncpLevel: getLevelFromRNCPCertification(rncpCertification),
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
    },
  });
};
