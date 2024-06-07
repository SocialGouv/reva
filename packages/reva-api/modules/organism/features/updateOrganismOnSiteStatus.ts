import { prismaClient } from "../../../prisma/client";

export const updateOrganismOnSiteStatus = ({
  organismId,
  isOnSite,
}: {
  organismId: string;
  isOnSite: boolean;
}) =>
  prismaClient.organism.update({
    where: { id: organismId },
    data: { isOnSite },
  });
