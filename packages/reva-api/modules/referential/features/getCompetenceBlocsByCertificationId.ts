import { prismaClient } from "../../../prisma/client";
import { CertificationCompetenceBloc } from "@prisma/client";

import { RNCPReferential } from "../rncp";

type Params = {
  certificationId: string;
  rncpId: string;
};

export const getCompetenceBlocsByCertificationId = async (params: Params) => {
  const { certificationId } = params;

  let competenceBlocs: CertificationCompetenceBloc[] =
    await prismaClient.certificationCompetenceBloc.findMany({
      where: {
        certificationId: certificationId,
      },
      include: {
        competences: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

  // Set default blocs on the fly
  if (competenceBlocs.length == 0) {
    competenceBlocs = await createDefaultBlocs(params);
  }

  return competenceBlocs;
};

const createDefaultBlocs = async (
  params: Params,
): Promise<CertificationCompetenceBloc[]> => {
  const { certificationId, rncpId } = params;

  const rncpCertification =
    await RNCPReferential.getInstance().findOneByRncp(rncpId);

  if (rncpCertification) {
    for (const bloc of rncpCertification.BLOCS_COMPETENCES) {
      const createdBloc = await prismaClient.certificationCompetenceBloc.create(
        {
          data: {
            code: bloc.CODE,
            label: bloc.LIBELLE,
            isOptional: bloc.FACULTATIF,
            FCCompetences: bloc.LISTE_COMPETENCES,
            certificationId,
          },
        },
      );

      await prismaClient.certificationCompetence.createMany({
        data: bloc.PARSED_COMPETENCES.map((competence) => ({
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
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

  return competenceBlocs;
};
