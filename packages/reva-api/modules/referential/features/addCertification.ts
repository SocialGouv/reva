import { CertificationCompetenceBloc } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

import { RNCPCertification, RNCPReferential } from "../rncp";
import { getFormacodes, Formacode } from "./getFormacodes";
import { getSubdomains } from "./getDomainsByFormacodes";

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
      fcPrerequisites: rncpCertification.PREREQUIS.LISTE_PREREQUIS,
      prerequisites: {
        createMany: {
          data: rncpCertification.PREREQUIS.PARSED_PREREQUIS.map((p, i) => ({
            label: p,
            index: i,
          })),
        },
      },
    },
  });

  // Link certification to sub domains
  const referential = await getFormacodes();

  const subDomains: Formacode[] = getSubdomains(
    rncpCertification.FORMACODES,
    referential,
  );

  // Create all links
  await prismaClient.certificationOnFormacode.createMany({
    data: subDomains.map((subDomain) => ({
      formacodeId: subDomain.id,
      certificationId: certification.id,
    })),
  });

  // Create default competence blocs
  await createDefaultBlocs({
    certificationId: certification.id,
    rncpCertification,
  });

  return certification;
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

const createDefaultBlocs = async ({
  certificationId,
  rncpCertification,
}: {
  certificationId: string;
  rncpCertification: RNCPCertification;
}): Promise<CertificationCompetenceBloc[]> => {
  if (rncpCertification) {
    for (const bloc of rncpCertification.BLOCS_COMPETENCES) {
      const createdBloc = await prismaClient.certificationCompetenceBloc.create(
        {
          data: {
            code: bloc.CODE,
            label: bloc.LIBELLE,
            FCCompetences: bloc.LISTE_COMPETENCES,
            certificationId,
          },
        },
      );

      await prismaClient.certificationCompetence.createMany({
        data: bloc.PARSED_COMPETENCES.map((competence, index) => ({
          index,
          label: competence,
          blocId: createdBloc.id,
        })),
      });
    }
  }

  const competenceBlocs: CertificationCompetenceBloc[] =
    await prismaClient.certificationCompetenceBloc.findMany({
      where: {
        certificationId: certificationId,
      },
      include: {
        competences: {
          orderBy: { index: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

  return competenceBlocs;
};
