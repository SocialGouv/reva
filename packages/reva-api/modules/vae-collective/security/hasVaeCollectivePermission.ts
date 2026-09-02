import { PermissionVaeCollective } from "@prisma/client";
import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_RESOURCE_ACCESS } from "@/modules/shared/security/messages";
import { hasRole, whenHasRole } from "@/modules/shared/security/middlewares";
import { isGestionnaireOfCohorteVaeCollective } from "@/modules/shared/security/middlewares/isGestionnaireOfCohorteVaeCollective";
import { isGestionnaireOfCommanditaireVaeCollective } from "@/modules/shared/security/middlewares/isGestionnaireOfCommanditaireVaeCollective";

import { getUserPermissions } from "../features/getUserPermissions";

// Permissions portant sur une cohorte précise : le simple rattachement au
// commanditaire ne suffit pas, il faut aussi vérifier que la cohorte visée
// (args.cohorteVaeCollectiveId) appartient bien à ce commanditaire.
const COHORTE_SCOPED_PERMISSIONS: ReadonlySet<PermissionVaeCollective> =
  new Set(["VOIR_COHORTE", "MODIFIER_COHORTE", "SUPPRIMER_COHORTE"]);

export const hasVaeCollectivePermission = (
  permission: PermissionVaeCollective,
) => [
  hasRole(["admin", "manage_vae_collective"]),
  whenHasRole(
    "manage_vae_collective",
    COHORTE_SCOPED_PERMISSIONS.has(permission)
      ? isGestionnaireOfCohorteVaeCollective
      : isGestionnaireOfCommanditaireVaeCollective,
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
    const userKeycloakId = context.auth?.userInfo?.sub || "";
    const userKeycloakRoles = context.auth?.userInfo?.realm_access?.roles || [];

    const userPermissions = await getUserPermissions({
      userKeycloakId,
      userKeycloakRoles,
    });
    const hasPermission = userPermissions.includes(permission);

    if (!hasPermission) {
      throw new Error(NOT_AUTHORIZED_RESOURCE_ACCESS);
    }

    return next(root, args, context, info);
  };
