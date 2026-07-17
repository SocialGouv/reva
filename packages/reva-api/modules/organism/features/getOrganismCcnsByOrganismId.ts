import { IDENTIFIANT_ORGANISME_VIDE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

export const getOrganismCcnsByOrganismId = ({
  organismId,
}: {
  organismId: string;
}) => {
  if (!organismId) {
    throw new Error(IDENTIFIANT_ORGANISME_VIDE);
  }
  return prismaClient.conventionCollective.findMany({
    where: { organismOnConventionCollective: { some: { organismId } } },
  });
};
