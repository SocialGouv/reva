import { prismaClient } from "../../../prisma/client";

export const getCertificationCohorteVaeCollectiveByCohorteVAECollectiveId = ({
  cohorteVaeCollectiveId,
}: {
  cohorteVaeCollectiveId?: string;
}) =>
  cohorteVaeCollectiveId
    ? prismaClient.certificationCohorteVaeCollective.findMany({
        where: { cohorteVaeCollectiveId },
      })
    : null;
