import { prismaClient } from "@/prisma/client";

export const getOrganismFormacodesByOrganismId = ({
  organismId,
}: {
  organismId: string;
}) => {
  if (!organismId) {
    throw new Error("Identifiant d'organisme vide");
  }
  return prismaClient.formacode.findMany({
    where: { organismOnFormacode: { some: { organismId } }, version: "v14" },
  });
};
