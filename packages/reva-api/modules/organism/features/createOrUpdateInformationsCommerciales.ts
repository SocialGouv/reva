import { prismaClient } from "../../../prisma/client";
import { OrganismInformationsCommerciales } from "../organism.types";

export const createOrUpdateInformationsCommerciales = ({
  informationsCommerciales,
  organismId,
}: {
  informationsCommerciales: OrganismInformationsCommerciales;
  organismId: string;
}) =>
  prismaClient.organism.update({
    where: { id: organismId },
    data: informationsCommerciales,
  });
