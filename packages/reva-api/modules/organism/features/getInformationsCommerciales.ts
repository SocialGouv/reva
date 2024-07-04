import { prismaClient } from "../../../prisma/client";

export const getInformationsCommercialesByOrganismIds = ({
  organismIds,
}: {
  organismIds: string[];
}) =>
  prismaClient.organismInformationsCommerciales.findMany({
    where: { organismId: { in: organismIds } },
  });
