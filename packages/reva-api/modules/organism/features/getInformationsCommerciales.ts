import { prismaClient } from "../../../prisma/client";

export const getInformationsCommerciales = ({
  organismId,
}: {
  organismId: string;
}) =>
  prismaClient.organismInformationsCommerciales.findFirst({
    where: { organismId },
  });
