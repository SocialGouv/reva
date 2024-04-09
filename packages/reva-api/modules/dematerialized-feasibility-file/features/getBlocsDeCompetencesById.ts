import { prismaClient } from "../../../prisma/client";

export const getBlocsDeCompetencesById = ({
  blocDeCompetencesId,
}: {
  blocDeCompetencesId: string;
}) =>
  prismaClient.dFFCertificationCompetenceBloc.findUnique({
    where: { id: blocDeCompetencesId },
  });
