import { prismaClient } from "@/prisma/client";

export const getCohortesVaeCollectivesForConnectedAap = async ({
  userKeycloakId,
  userRoles,
}: {
  userKeycloakId: string;
  userRoles: KeyCloakUserRole[];
}) => {
  //Si l'aap est gestionnaire de maison mère on
  //retourne toutes les cohortes de vae collectives associées à une candidature faisant partie de la maison mère de l'aap
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
        candidacy: {
          some: {
            organism: { maisonMereAAPId: userMaisonMereAAP.id },
          },
        },
      },
    });
  }

  //Si l'aap est un aap non gestionnaire de maison mère on
  //retourne toutes les cohortes de vae collectives dont au moins une candidature est associée à son organisme
  else if (userRoles.includes("manage_candidacy")) {
    const userOrganism = await prismaClient.organism.findFirst({
      where: {
        organismOnAccounts: {
          some: { account: { keycloakId: userKeycloakId } },
        },
      },
    });
    if (!userOrganism) {
      return [];
    }
    return prismaClient.cohorteVaeCollective.findMany({
      where: {
        candidacy: {
          some: {
            organismId: userOrganism.id,
          },
        },
      },
    });
  }

  return [];
};
