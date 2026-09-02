import { prismaClient } from "@/prisma/client";

import { getPermissionsForRoles } from "./getPermissionsForRole";
import { getUserPermissionsSpecificToSousCompte } from "./getUserPermissionsSpecifictoSousCompte";
import { getVaeCollectiveRolesFromKeycloakRoles } from "./getVaeCollectiveRolesFromKeycloakRoles";

export const getUserPermissions = async ({
  userKeycloakId,
  userKeycloakRoles,
}: {
  userKeycloakId: string;
  userKeycloakRoles: string[];
}) => {
  const permissions = [];
  const vaeCollectiveRoles = await getVaeCollectiveRolesFromKeycloakRoles({
    userKeycloakRoles,
  });

  const permissionsFromRoles = await getPermissionsForRoles({
    roles: vaeCollectiveRoles,
  });

  permissions.push(...permissionsFromRoles);

  const sousCompteVaeCollective =
    await prismaClient.sousCompteVaeCollective.findFirst({
      where: { account: { keycloakId: userKeycloakId } },
    });

  if (sousCompteVaeCollective) {
    const permissionsSpecificToSousCompte =
      await getUserPermissionsSpecificToSousCompte({
        sousCompteVaeCollectiveId: sousCompteVaeCollective.id,
      });
    permissions.push(...permissionsSpecificToSousCompte);
  }

  return Array.from(permissions);
};
