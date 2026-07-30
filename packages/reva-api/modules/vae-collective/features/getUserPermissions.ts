import { getPermissionsForRoles } from "./getPermissionsForRole";
import { getVaeCollectiveRolesFromKeycloakRoles } from "./getVaeCollectiveRolesFromKeycloakRoles";

export const getUserPermissions = async ({
  userKeycloakRoles,
}: {
  userKeycloakRoles: string[];
}) => {
  const vaeCollectiveRoles = await getVaeCollectiveRolesFromKeycloakRoles({
    userKeycloakRoles,
  });

  const permissions = await getPermissionsForRoles({
    roles: vaeCollectiveRoles,
  });

  return permissions;
};
