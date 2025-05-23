import { prismaClient } from "../../../prisma/client";

export const getCohortesVaeCollectivesForConnectedAap = async ({
  userKeycloakId,
  userRoles,
}: {
  userKeycloakId: string;
  userRoles: KeyCloakUserRole[];
}) => {
  //Si l'aap est gestionnaire de maison mère on
  //retourne toutes les cohortes de vae collectives associées à un organisme faisant partie de la maison mère de l'aap
  if (userRoles.includes("gestion_maison_mere_aap")) {
    const userMaisonMereAAP = await prismaClient.maisonMereAAP.findFirst({
      where: {
        gestionnaire: { keycloakId: userKeycloakId },
      },
    });
    if (!userMaisonMereAAP) {
      return [];
    }
    return prismaClient.cohorteVaeCollective.findMany({
      where: {
        certificationCohorteVaeCollectives: {
          some: {
            certificationCohorteVaeCollectiveOnOrganisms: {
              some: {
                organism: { maisonMereAAPId: userMaisonMereAAP.id },
              },
            },
          },
        },
      },
    });
  }

  //Si l'aap est un aap non gestionnaire de maison mère on
  //retourne toutes les cohortes de vae collectives associées à son organisme
  else if (userRoles.includes("manage_candidacy")) {
    const userOrganism = await prismaClient.organism.findFirst({
      where: {
        accounts: { some: { keycloakId: userKeycloakId } },
      },
    });
    if (!userOrganism) {
      return [];
    }
    return prismaClient.cohorteVaeCollective.findMany({
      where: {
        certificationCohorteVaeCollectives: {
          some: {
            certificationCohorteVaeCollectiveOnOrganisms: {
              some: {
                organismId: userOrganism.id,
              },
            },
          },
        },
      },
    });
  }

  return [];
};
