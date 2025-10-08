import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { RNCPReferential } from "../rncp/referential";
import { getLevelFromRNCPCertification } from "../utils/rncp.helpers";

import { Formacode, getFormacodes } from "./getFormacodes";

type CertificationFormacode = Formacode & {
  isMain: boolean;
};

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

  const subDomains: CertificationFormacode[] = [];

  for (let index = 0; index < rncpCertification.FORMACODES.length; index++) {
    const isMain = index == 0;

    const rncpFormacode = rncpCertification.FORMACODES[index];
    const formacode = getFormacodeByCode(rncpFormacode.CODE, referential);

    if (!formacode) {
      const error = new Error(
        `Le formacode avec le code ${rncpFormacode.CODE} n'existe pas dans le référentiel RNCP`,
      );
      logger.error(error);

      // stop here and continue with the next iteration
      continue;
    }

    const parents = getParents(formacode, referential);
    const subDomain = parents.find(
      (formacode) => formacode.type == "SUB_DOMAIN",
    );
    if (
      subDomain &&
      subDomains.findIndex((domain) => domain.code == subDomain.code) == -1
    ) {
      subDomains.push({
        ...subDomain,
        isMain,
      });
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
      isMain: subDomain.isMain,
    })),
  });
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
