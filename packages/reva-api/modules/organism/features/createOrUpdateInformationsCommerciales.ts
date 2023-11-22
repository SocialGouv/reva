import { prismaClient } from "../../../prisma/client";
import { OrganismInformationsCommerciales } from "../organism.types";

export const createOrUpdateInformationsCommerciales = ({
  informationsCommerciales,
}: {
  informationsCommerciales: OrganismInformationsCommerciales & {
    id: string | null;
  };
}) =>
  prismaClient.organismInformationsCommerciales.upsert({
    where: { organismId: informationsCommerciales.organismId },
    create: informationsCommerciales,
    update: informationsCommerciales,
  });
