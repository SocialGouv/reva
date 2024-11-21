import { prismaClient } from "../../../prisma/client";
import { RNCPCertification, RNCPReferential } from "../rncp";

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

  // Update certification from based on RNCP
  await prismaClient.certification.update({
    where: { id: certification.id },
    data: {
      label,
      level,
      availableAt,
      expiresAt,
      // RNCP Fields
      rncpLabel: rncpCertification.INTITULE,
      rncpLevel: getLevelFromRNCPCertification(rncpCertification),
      rncpTypeDiplome: rncpCertification.ABREGE?.LIBELLE,
      rncpExpiresAt: new Date(rncpCertification.DATE_FIN_ENREGISTREMENT),
      rncpDeliveryDeadline: rncpCertification.DATE_LIMITE_DELIVRANCE
        ? new Date(rncpCertification.DATE_LIMITE_DELIVRANCE)
        : null,
    },
  });
};

const getLevelFromRNCPCertification = (
  certification: RNCPCertification,
): number => {
  try {
    const strLevel =
      certification.NOMENCLATURE_EUROPE?.INTITULE.split(" ").reverse()[0] || "";
    const level = parseInt(strLevel, 10);
    return level;
  } catch {
    throw new Error(
      `Le niveau de la certification pour le code RNCP ${certification.ID_FICHE} n'a pas pu être formatté`,
    );
  }
};
