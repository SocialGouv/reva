import { prismaClient } from "../../../prisma/client";

export const getBlocsDeCompetencesByDFFId = ({
  dematerializedFeasibilityFileId,
}: {
  dematerializedFeasibilityFileId: string;
}) =>
  prismaClient.dFFCertificationCompetenceBloc.findMany({
    where: { dematerializedFeasibilityFileId },
  });
