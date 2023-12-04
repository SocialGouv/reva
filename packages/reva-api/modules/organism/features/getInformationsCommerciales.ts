import { prismaClient } from "../../../prisma/client";

export const getInformationsCommerciales = ({
  organismId,
}: {
  organismId: string;
}) =>
  prismaClient.organismInformationsCommerciales.findFirst({
    where: { organismId },
  });

export const getInformationsCommercialesByOrganismIds = ({
  organismIds,
}: {
  organismIds: string[];
}) =>
  prismaClient.organismInformationsCommerciales.findMany({
    where: { organismId: { in: organismIds } },
  });
