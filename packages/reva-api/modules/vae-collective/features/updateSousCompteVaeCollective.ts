import { prismaClient } from "@/prisma/client";

export const updateSousCompteVaeCollective = async ({
  sousCompteVaeCollectiveId,
  canCreateCohorteVaeCollective,
}: {
  sousCompteVaeCollectiveId: string;
  canCreateCohorteVaeCollective: boolean;
}) => {
  const sousCompteVaeCollective =
    await prismaClient.sousCompteVaeCollective.findUnique({
      where: { id: sousCompteVaeCollectiveId },
    });

  if (!sousCompteVaeCollective) {
    throw new Error("Sous-compte non trouvé");
  }

  if (canCreateCohorteVaeCollective) {
    await prismaClient.permissionSpecificToSousCompteVaeCollective.upsert({
      where: {
        permission_sousCompteVaeCollectiveId: {
          permission: "CREER_COHORTE",
          sousCompteVaeCollectiveId,
        },
      },
      create: { sousCompteVaeCollectiveId, permission: "CREER_COHORTE" },
      update: {},
    });
  } else {
    await prismaClient.permissionSpecificToSousCompteVaeCollective.deleteMany({
      where: { sousCompteVaeCollectiveId, permission: "CREER_COHORTE" },
    });
  }

  return sousCompteVaeCollective;
};
