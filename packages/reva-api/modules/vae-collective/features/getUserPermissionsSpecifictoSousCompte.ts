import { prismaClient } from "@/prisma/client";

export const getUserPermissionsSpecificToSousCompte = async ({
  sousCompteVaeCollectiveId,
}: {
  sousCompteVaeCollectiveId: string;
}) => {
  if (!sousCompteVaeCollectiveId) {
    return [];
  }
  const permissions =
    await prismaClient.permissionSpecificToSousCompteVaeCollective
      .findMany({
        where: {
          sousCompteVaeCollectiveId,
        },
      })
      .then((permissions) =>
        permissions.map((permission) => permission.permission),
      );

  return permissions;
};
