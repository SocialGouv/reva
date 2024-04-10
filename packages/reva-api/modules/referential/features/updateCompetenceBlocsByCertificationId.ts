import { prismaClient } from "../../../prisma/client";
import { CertificationCompetenceBloc } from "@prisma/client";

type Competence = {
  id?: string;
  index: number;
  label: string;
};

type Bloc = {
  id?: string;
  code?: string;
  label: string;
  isOptional?: boolean;
  FCCompetences?: string;
  competences: Competence[];
};

type Params = {
  certificationId: string;
  blocs: Bloc[];
};

export const updateCompetenceBlocsByCertificationId = async (
  params: Params,
) => {
  const { certificationId, blocs } = params;

  // Load certification with blocs and competences of bloc
  const certification = await prismaClient.certification.findUnique({
    where: { id: certificationId },
    include: {
      competenceBlocs: {
        include: {
          competences: true,
        },
      },
    },
  });
  if (!certification) {
    throw new Error(`Certification non trouvée`);
  }

  // Delete all blocs that has not been found in Params['blocs']
  const blocsToDelete = certification.competenceBlocs.filter(
    (bloc) => blocs.findIndex((cb) => cb.id == bloc.id) == -1,
  );
  await prismaClient.certificationCompetenceBloc.deleteMany({
    where: { id: { in: blocsToDelete.map((bloc) => bloc.id) } },
  });

  // Create all blocs with no id
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
        id: competence.id,
        index: competence.index,
        label: competence.label,
        blocId: createdBloc.id,
      })),
    });
  }

  // Update all blocs that has been found in Params['blocs']
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

      // Delete all competences that has not been found in inputBloc.competences
      const competencesToDelete = bloc.competences.filter(
        (competence) =>
          inputBloc.competences.findIndex((c) => c.id == competence.id) == -1,
      );
      await prismaClient.certificationCompetence.deleteMany({
        where: {
          id: { in: competencesToDelete.map((competence) => competence.id) },
        },
      });

      // Create all competences with no id and link them to blocId
      const competencesToCreate = inputBloc.competences.filter(
        (competence) => !competence.id,
      );
      await prismaClient.certificationCompetence.createMany({
        data: competencesToCreate.map((competence) => ({
          index: competence.index,
          label: competence.label,
          blocId: bloc.id,
        })),
      });

      // Update all competences that has been found in bloc.competences
      const competencesToUpdate = bloc.competences.filter(
        (c) =>
          inputBloc.competences.findIndex(
            (competence) => c.id == competence.id,
          ) != -1,
      );
      for (const competence of competencesToUpdate) {
        const inputCompetence = inputBloc.competences.find(
          ({ id }) => id == competence.id,
        );
        if (inputCompetence) {
          await prismaClient.certificationCompetence.update({
            where: { id: competence.id },
            data: {
              index: inputCompetence.index,
              label: inputCompetence.label,
            },
          });
        }
      }
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
