import { prismaClient } from "../../../prisma/client";
import { Organism } from "../organism.types";

export const getOrganismById = async (
  context: {
    hasRole: (role: string) => boolean;
  },
  params: {
    id: string;
  }
): Promise<Organism> => {
  const { hasRole } = context;
  if (!hasRole("admin")) {
    throw new Error("Utilisateur non autorisé");
  }

  const { id } = params;

  const organism = await prismaClient.organism.findUnique({
    where: { id },
  });

  if (!organism) {
    throw new Error("Organisme non trouvé");
  }

  return organism;
};
