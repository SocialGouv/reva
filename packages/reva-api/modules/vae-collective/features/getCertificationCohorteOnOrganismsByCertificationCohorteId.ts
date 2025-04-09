import { prismaClient } from "../../../prisma/client";

export const getCertificationCohorteOnOrganismsByCertificationCohorteId = ({
  certificationCohorteVaeCollectiveId,
}: {
  certificationCohorteVaeCollectiveId?: string;
}) =>
  certificationCohorteVaeCollectiveId
    ? prismaClient.certificationCohorteVaeCollectiveOnOrganism.findMany({
        where: { certificationCohorteVaeCollectiveId },
      })
    : null;
