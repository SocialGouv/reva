import { prismaClient } from "../../../prisma/client";

import { RNCPCertification, RNCPReferential } from "../rncp";
import { getFormacodes, Formacode } from "./getFormacodes";
import { getSubdomains } from "./getDomainsByFormacodes";
import { getCertificationById } from "./getCertificationById";

export const replaceCertification = async (params: {
  codeRncp: string;
  certificationId: string;
}) => {
  const { codeRncp, certificationId } = params;

  const existingCertification = await getCertificationById({ certificationId });
  if (!existingCertification) {
    throw new Error(
      `La certification avec l'ID ${certificationId} n'existe pas`,
    );
  }

  const existingCertificationWithSameRncp =
    await prismaClient.certification.findFirst({
      where: { rncpId: codeRncp },
    });
  if (existingCertificationWithSameRncp) {
    throw new Error(
      `Une certification avec le code RNCP ${codeRncp} existe déjà`,
    );
  }

  const rncpCertification =
    await RNCPReferential.getInstance().findOneByRncp(codeRncp);
  if (!rncpCertification) {
    throw new Error(
      `La certification avec le code RNCP ${codeRncp} n'existe pas dans le référentiel RNCP`,
    );
  }

  if (rncpCertification.FORMACODES.length == 0) {
    throw new Error(
      `La certification avec le code RNCP ${codeRncp} n'est associée à aucun formacode`,
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
      `La certification avec le code RNCP ${codeRncp} n'a pas de date de fin d'enregistrement`,
    );
  }

  const existingCertificationWithSamePreviousVersion =
    await prismaClient.certification.findFirst({
      where: { previousVersionCertificationId: certificationId },
    });

  if (existingCertificationWithSamePreviousVersion) {
    throw new Error(
      `Une version plus récente de cette certification existe déjà`,
    );
  }

  const expiresAt = new Date(rncpCertification.DATE_FIN_ENREGISTREMENT);

  const newCertification = await prismaClient.certification.create({
    data: {
      status: "A_VALIDER_PAR_CERTIFICATEUR",
      certificationStatusHistory: {
        create: {
          status: "A_VALIDER_PAR_CERTIFICATEUR",
        },
      },
      label,
      level,
      availableAt,
      expiresAt,
      visible: false,

      // Set RNCP fields:
      rncpId: codeRncp,
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

      // Inherit data from existing certification:
      feasibilityFormat: existingCertification.feasibilityFormat,
      previousVersionCertificationId: certificationId,
      certificationAuthorityStructureId:
        existingCertification.certificationAuthorityStructureId,
    },
  });

  // Link new certification to sub domains (formacodes)
  const referential = await getFormacodes();
  const subDomains: Formacode[] = getSubdomains(
    rncpCertification.FORMACODES,
    referential,
  );

  // Create links between new certification and formacodes
  await prismaClient.certificationOnFormacode.createMany({
    data: subDomains.map((subDomain) => ({
      formacodeId: subDomain.id,
      certificationId: newCertification.id,
    })),
  });

  // Create certification competence blocs for the new certification
  await createCompetenceBlocs({
    certificationId: newCertification.id,
    rncpCertification,
  });

  // Copy relationships from old certification to new certification

  // 1. Copy certification authority relationships
  const certificationAuthorities =
    await prismaClient.certificationAuthorityOnCertification.findMany({
      where: { certificationId },
    });

  if (certificationAuthorities.length > 0) {
    await prismaClient.certificationAuthorityOnCertification.createMany({
      data: certificationAuthorities.map((ca) => ({
        certificationId: newCertification.id,
        certificationAuthorityId: ca.certificationAuthorityId,
      })),
    });
  }

  // 2. Copy certification authority local account relationships
  const certificationAuthorityLocalAccounts =
    await prismaClient.certificationAuthorityLocalAccountOnCertification.findMany(
      {
        where: { certificationId },
      },
    );

  if (certificationAuthorityLocalAccounts.length > 0) {
    await prismaClient.certificationAuthorityLocalAccountOnCertification.createMany(
      {
        data: certificationAuthorityLocalAccounts.map((cala) => ({
          certificationId: newCertification.id,
          certificationAuthorityLocalAccountId:
            cala.certificationAuthorityLocalAccountId,
        })),
      },
    );
  }

  // 3. Copy convention collective relationships
  const conventionCollectives =
    await prismaClient.certificationOnConventionCollective.findMany({
      where: { certificationId },
    });

  if (conventionCollectives.length > 0) {
    await prismaClient.certificationOnConventionCollective.createMany({
      data: conventionCollectives.map((cc) => ({
        certificationId: newCertification.id,
        ccnId: cc.ccnId,
      })),
    });
  }

  return newCertification;
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

const createCompetenceBlocs = async ({
  certificationId,
  rncpCertification,
}: {
  certificationId: string;
  rncpCertification: RNCPCertification;
}) => {
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

  const competenceBlocs =
    await prismaClient.certificationCompetenceBloc.findMany({
      where: {
        certificationId,
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
