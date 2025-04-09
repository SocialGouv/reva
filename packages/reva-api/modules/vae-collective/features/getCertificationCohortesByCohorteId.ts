import { prismaClient } from "../../../prisma/client";

export const getCertificationCohortesByCohorteId = ({
  cohorteVaeCollectiveId,
}: {
  cohorteVaeCollectiveId?: string;
}) =>
  cohorteVaeCollectiveId
    ? prismaClient.certificationCohorteVaeCollective.findMany({
        where: { cohorteVaeCollectiveId },
      })
    : null;
