import { CertificationCompetenceBloc } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { RNCPCertification } from "../rncp/referential";

export const createCompetenceBlocsFromRncp = async ({
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

  const competenceBlocs =
    await prismaClient.certificationCompetenceBloc.findMany({
      where: { certificationId },
      include: { competences: { orderBy: { index: "asc" } } },
      orderBy: { createdAt: "asc" },
    });

  return competenceBlocs;
};
