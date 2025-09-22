import { CertificationCompetenceBloc } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { RNCPReferential } from "../rncp/referential";

export const resetCompetenceBlocsByCertificationId = async (params: {
  certificationId: string;
}) => {
  const { certificationId } = params;

  const certification = await prismaClient.certification.findFirst({
    where: { id: certificationId },
  });
  if (!certification) {
    throw new Error(
      `La certification pour l'id ${certificationId} n'existe pas`,
    );
  }

  if (certification.status != "BROUILLON") {
    throw new Error(
      "Le statut de la certification doit être à l'état 'Brouillon'",
    );
  }

  // Delete previous blocs
  await prismaClient.certificationCompetenceBloc.deleteMany({
    where: {
      certificationId,
    },
  });

  // Create default competence blocs
  await createDefaultBlocs({
    certificationId: certification.id,
    codeRncp: certification.rncpId,
  });

  return certification;
};

const createDefaultBlocs = async (params: {
  certificationId: string;
  codeRncp: string;
}): Promise<CertificationCompetenceBloc[]> => {
  const { certificationId, codeRncp } = params;

  const rncpCertification =
    await RNCPReferential.getInstance().findOneByRncp(codeRncp);

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
