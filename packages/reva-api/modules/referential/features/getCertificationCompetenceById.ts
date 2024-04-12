import { prismaClient } from "../../../prisma/client";

export const getCertificationCompetenceById = ({
  certificationCompetenceId,
}: {
  certificationCompetenceId: string;
}) =>
  prismaClient.certificationCompetence.findUnique({
    where: { id: certificationCompetenceId },
  });
