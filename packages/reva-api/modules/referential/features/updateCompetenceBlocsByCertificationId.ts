import { prismaClient } from "../../../prisma/client";
import { CertificationCompetenceBloc } from "@prisma/client";

type Bloc = {
  id: string;
  isOptional?: boolean;
  competences: string[];
};

type Params = {
  certificationId: string;
  blocs: Bloc[];
};

export const updateCompetenceBlocsByCertificationId = async (
  params: Params,
) => {
  const { certificationId, blocs } = params;

  const certification = await prismaClient.certification.findUnique({
    where: { id: certificationId },
    include: {
      competenceBlocs: true,
    },
  });
  if (!certification) {
    throw new Error(`Certification non trouvée`);
  }

  for (const bloc of certification.competenceBlocs) {
    const inputBloc = blocs.find(({ id }) => id == bloc.id);
    if (inputBloc) {
      await prismaClient.certificationCompetenceBloc.update({
        where: { id: bloc.id },
        data: {
          isOptional: inputBloc.isOptional,
        },
      });

      await prismaClient.certificationCompetence.deleteMany({
        where: { blocId: bloc.id },
      });

      await prismaClient.certificationCompetence.createMany({
        data: inputBloc.competences.map((competence) => ({
          label: competence,
          blocId: bloc.id,
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
        competences: true,
      },
    });

  return competenceBlocs;
};
