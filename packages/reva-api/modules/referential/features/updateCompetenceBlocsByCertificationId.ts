import { prismaClient } from "../../../prisma/client";
import { CertificationCompetenceBloc } from "@prisma/client";

type Bloc = {
  id?: string;
  code?: string;
  label: string;
  isOptional?: boolean;
  FCCompetences?: string;
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

  const blocsToDelete = certification.competenceBlocs.filter(
    (bloc) => blocs.findIndex((cb) => cb.id == bloc.id) == -1,
  );
  await prismaClient.certificationCompetenceBloc.deleteMany({
    where: { id: { in: blocsToDelete.map((bloc) => bloc.id) } },
  });

  const blocsToCreate = blocs.filter((bloc) => !bloc.id);
  for (const bloc of blocsToCreate) {
    const createdBloc = await prismaClient.certificationCompetenceBloc.create({
      data: {
        code: bloc.code,
        label: bloc.label,
        isOptional: bloc.isOptional,
        FCCompetences: bloc.FCCompetences,
        certificationId,
      },
    });

    await prismaClient.certificationCompetence.createMany({
      data: bloc.competences.map((competence) => ({
        label: competence,
        blocId: createdBloc.id,
      })),
    });
  }

  const blocsToUpdate = certification.competenceBlocs.filter(
    (cb) => blocs.findIndex((bloc) => cb.id == bloc.id) != -1,
  );
  for (const bloc of blocsToUpdate) {
    const inputBloc = blocs.find(({ id }) => id == bloc.id);
    if (inputBloc) {
      await prismaClient.certificationCompetenceBloc.update({
        where: { id: bloc.id },
        data: {
          label: inputBloc.label,
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
