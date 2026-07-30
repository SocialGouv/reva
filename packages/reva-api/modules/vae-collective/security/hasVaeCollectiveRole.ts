import { PermissionVaeCollective } from "@prisma/client";
import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_RESOURCE_ACCESS } from "@/modules/shared/security/messages";
import { hasRole, whenHasRole } from "@/modules/shared/security/middlewares";
import { isGestionnaireOfCommanditaireVaeCollective } from "@/modules/shared/security/middlewares/isGestionnaireOfCommanditaireVaeCollective";

import { getUserPermissions } from "../features/getUserPermissions";

export const hasVaeCollectivePermission = (
  permission: PermissionVaeCollective,
) => [
  hasRole(["admin", "manage_vae_collective"]),
  whenHasRole(
    "manage_vae_collective",
    isGestionnaireOfCommanditaireVaeCollective,
  ),
  whenHasRole("manage_vae_collective", checkUserPermission(permission)),
];

const checkUserPermission =
  (permission: PermissionVaeCollective) =>
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const userKeycloakRoles = context.auth?.userInfo?.realm_access?.roles || [];

    const userPermissions = await getUserPermissions({ userKeycloakRoles });
    const hasPermission = userPermissions.includes(permission);

    if (!hasPermission) {
      throw new Error(NOT_AUTHORIZED_RESOURCE_ACCESS);
    }

    return next(root, args, context, info);
  };
