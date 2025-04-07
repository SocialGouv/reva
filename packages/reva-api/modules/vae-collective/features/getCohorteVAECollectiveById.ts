import { prismaClient } from "../../../prisma/client";

export const getCohorteVAECollectiveById = ({
  cohorteVaeCollectiveId,
}: {
  cohorteVaeCollectiveId?: string;
}) =>
  cohorteVaeCollectiveId
    ? prismaClient.cohorteVaeCollective.findUnique({
        where: { id: cohorteVaeCollectiveId },
      })
    : null;
