import { prismaClient } from "../../../prisma/client";

export const getBlocsDeCompetencesByDFFId = ({
  dematerializedFeasibilityFileId,
}: {
  dematerializedFeasibilityFileId: string;
}) =>
  prismaClient.certificationCompetenceBloc.findMany({
    where: {
      dffCertificationCompetenceBloc: {
        some: { dematerializedFeasibilityFileId },
      },
    },
  });
