import { prismaClient } from "../../../prisma/client";

export const getOrganismDomainesByOrganismId = ({
  organismId,
}: {
  organismId: string;
}) => {
  if (!organismId) {
    throw new Error("Identifiant d'organisme vide");
  }
  return prismaClient.domaine.findMany({
    where: { organismOnDomaine: { some: { organismId } } },
  });
};
