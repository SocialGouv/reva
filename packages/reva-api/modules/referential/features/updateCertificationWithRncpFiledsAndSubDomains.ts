import { prismaClient } from "../../../prisma/client";
import { RNCPCertification, RNCPReferential } from "../rncp";
import { getFormacodes, Formacode } from "./getFormacodes";

export const updateCertificationWithRncpFiledsAndSubDomains = async (params: {
  rncpId: string;
}) => {
  const { rncpId } = params;

  const certification = await prismaClient.certification.findFirst({
    where: { rncpId },
  });
  if (!certification) {
    throw new Error(
      `La certification avec le code rncp ${rncpId} n'existe pas`,
    );
  }

  const rncpCertification =
    await RNCPReferential.getInstance().findOneByRncp(rncpId);
  if (!rncpCertification) {
    throw new Error(
      `La certification avec le code rncp ${rncpId} n'existe pas dans le référentiel RNCP`,
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
    },
  });

  // Link certification to sub domains
  const referential = await getFormacodes();

  const subDomains: Formacode[] = [];

  for (const rncpFormacode of rncpCertification.FORMACODES) {
    const formacode = getFormacodeByCode(rncpFormacode.CODE, referential);

    if (!formacode) {
      throw new Error(
        `Le formacode avec le code ${rncpFormacode.CODE} n'existe pas dans le référentiel RNCP`,
      );
    }

    const parents = getParents(formacode, referential);
    const subDomain = parents.find(
      (formacode) => formacode.type == "SUB_DOMAIN",
    );
    if (
      subDomain &&
      subDomains.findIndex((domain) => domain.code == subDomain.code) == -1
    ) {
      subDomains.push(subDomain);
    }
  }

  // Remove all links by certificationId
  await prismaClient.certificationOnFormacode.deleteMany({
    where: { certificationId: certification.id },
  });

  // Create all links
  await prismaClient.certificationOnFormacode.createMany({
    data: subDomains.map((subDomain) => ({
      formacodeId: subDomain.id,
      certificationId: certification.id,
    })),
  });
};

const getLevelFromRNCPCertification = (
  certification: RNCPCertification,
): number => {
  try {
    const strLevel =
      certification.NOMENCLATURE_EUROPE.INTITULE.split(" ").reverse()[0];
    const level = parseInt(strLevel, 10);
    return level;
  } catch {
    throw new Error(
      `Le niveau de la certification pour le code RNCP ${certification.ID_FICHE} n'a pas pu être formatté`,
    );
  }
};

const getFormacodeByCode = (
  code: string,
  referential: Formacode[],
): Formacode | undefined => {
  return referential.find((formacode) => formacode.code == code);
};

const getParent = (child: Formacode, referential: Formacode[]) => {
  return referential.find((formacode) => formacode.code == child.parentCode);
};

const getParents = (
  formacode: Formacode,
  referential: Formacode[],
): Formacode[] => {
  const parent = getParent(formacode, referential);

  if (parent) {
    return [...getParents(parent, referential), formacode];
  }

  return [formacode];
};
