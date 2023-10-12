import { prismaClient } from "../../../prisma/client";
import { Organism } from "../organism.types";

export const updateOrganismById = async (
  context: {
    hasRole: (role: string) => boolean;
  },
  params: {
    organismId: string;
    organismData: {
      label: string;
      contactAdministrativeEmail: string;
      contactAdministrativePhone?: string;
      website?: string;
      isActive: boolean;
    };
  }
): Promise<Organism> => {
  const { hasRole } = context;
  if (!hasRole("admin")) {
    throw new Error("Utilisateur non autorisé");
  }

  const { organismId, organismData } = params;

  // Check if organism with organismId exsits
  const organism = await prismaClient.organism.findUnique({
    where: { id: organismId },
  });

  if (!organism) {
    throw new Error(`L'organisme pour l'id ${organismId} non trouvé`);
  }

  // Update Business DB
  await prismaClient.organism.update({
    where: { id: organism.id },
    data: {
      label: organismData.label,
      contactAdministrativeEmail: organismData.contactAdministrativeEmail,
      contactAdministrativePhone: organismData.contactAdministrativePhone,
      website: organismData.website,
      isActive: organismData.isActive,
    },
  });

  return organism;
};
