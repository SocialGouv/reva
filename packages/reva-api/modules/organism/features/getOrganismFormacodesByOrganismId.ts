import { IDENTIFIANT_ORGANISME_VIDE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

export const getOrganismFormacodesByOrganismId = ({
  organismId,
}: {
  organismId: string;
}) => {
  if (!organismId) {
    throw new Error(IDENTIFIANT_ORGANISME_VIDE);
  }
  return prismaClient.formacode.findMany({
    where: { organismOnFormacode: { some: { organismId } }, version: "v14" },
  });
};
