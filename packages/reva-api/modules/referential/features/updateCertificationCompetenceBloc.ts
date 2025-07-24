import { prismaClient } from "@/prisma/client";

import {
  CompetenceInput,
  UpdateCompetenceBlocInput,
} from "../referential.types";

export const updateCertificationCompetenceBloc = (
  args: UpdateCompetenceBlocInput,
) => {
  const competencesToUpdate = args.competences.filter(
    (competence): competence is CompetenceInput & { id: string } =>
      !!competence.id,
  );
  const competencesToCreate = args.competences.filter(
    (competence) => !competence.id,
  );

  return prismaClient.certificationCompetenceBloc.update({
    where: { id: args.id },
    data: {
      label: args.label,
      competences: {
        deleteMany: { id: { notIn: competencesToUpdate.map((c) => c.id) } },
        createMany: { data: competencesToCreate },
        updateMany: competencesToUpdate.map((c) => ({
          where: { id: c.id },
          data: c,
        })),
      },
    },
  });
};
