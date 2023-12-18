import { prismaClient } from "../../../prisma/client";
import {
  CreateOrUpdateOrganismWithMaisonMereAAPDataRequest,
  Organism,
} from "../organism.types";

export const updateOrganismWithMaisonMereAAPById = async (
  context: {
    hasRole: (role: string) => boolean;
  },
  params: {
    organismId: string;
    organismData: CreateOrUpdateOrganismWithMaisonMereAAPDataRequest;
  }
): Promise<Organism> => {
  const { hasRole } = context;
  if (!hasRole("gestion_maison_mere_aap")) {
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
  const [, , organismUpdate] = await prismaClient.$transaction([
    prismaClient.organismsOnDepartments.deleteMany({
      where: { organismId: organism.id },
    }),
    prismaClient.organismsOnDepartments.createMany({
      data: organismData.departmentsWithOrganismMethods.map((department) => ({
        departmentId: department.departmentId,
        organismId: organism.id,
        isOnSite: department.isOnSite,
        isRemote: department.isRemote,
      })),
    }),
    prismaClient.organism.update({
      where: { id: organism.id },
      data: {
        contactAdministrativeEmail: organismData.contactAdministrativeEmail,
        contactAdministrativePhone: organismData.contactAdministrativePhone,
        website: organismData.website,
        organismInformationsCommerciales: {
          update: {
            nom: organismData.nom,
            adresseNumeroEtNomDeRue: organismData.address,
            adresseInformationsComplementaires:
              organismData.adresseInformationsComplementaires,
            adresseCodePostal: organismData.zip,
            adresseVille: organismData.city,
            conformeNormesAccessbilite: organismData.conformeNormesAccessbilite,
            siteInternet: organismData.website,
            emailContact: organismData.contactAdministrativeEmail,
            telephone: organismData.contactAdministrativePhone,
          },
        },
      },
    }),
  ]);

  return organismUpdate;
};
