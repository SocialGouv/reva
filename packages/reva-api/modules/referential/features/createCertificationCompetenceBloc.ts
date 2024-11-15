import { prismaClient } from "../../../prisma/client";
import { CreateCompetenceBlocInput } from "../referential.types";

export const createCertificationCompetenceBloc = ({
  certificationId,
  label,
  competences,
}: CreateCompetenceBlocInput) =>
  prismaClient.certificationCompetenceBloc.create({
    data: {
      certificationId,
      label,
      competences: {
        createMany: { data: competences },
      },
    },
  });
