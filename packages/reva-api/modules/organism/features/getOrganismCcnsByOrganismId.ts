import { prismaClient } from "@/prisma/client";

export const getOrganismCcnsByOrganismId = ({
  organismId,
}: {
  organismId: string;
}) => {
  if (!organismId) {
    throw new Error("Identifiant d'organisme vide");
  }
  return prismaClient.conventionCollective.findMany({
    where: { organismOnConventionCollective: { some: { organismId } } },
  });
};
