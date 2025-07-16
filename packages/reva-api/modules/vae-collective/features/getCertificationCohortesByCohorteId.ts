import { prismaClient } from "../../../prisma/client";

export const getCertificationCohortesByCohorteId = ({
  cohorteVaeCollectiveId,
}: {
  cohorteVaeCollectiveId?: string;
}) =>
  cohorteVaeCollectiveId
    ? prismaClient.cohorteVaeCollective
        .findUnique({
          where: { id: cohorteVaeCollectiveId },
        })
        .certificationCohorteVaeCollectives()
    : null;
