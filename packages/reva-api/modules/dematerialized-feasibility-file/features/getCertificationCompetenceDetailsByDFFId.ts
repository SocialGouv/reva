import { prismaClient } from "../../../prisma/client";

export const getCertificationCompetenceDetailsByDFFId = ({
  dematerializedFeasibilityFileId,
}: {
  dematerializedFeasibilityFileId: string;
}) =>
  prismaClient.dFFCertificationCompetenceDetails.findMany({
    where: { dematerializedFeasibilityFileId },
  });
