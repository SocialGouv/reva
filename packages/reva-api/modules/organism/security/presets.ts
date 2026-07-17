import { hasRole, whenHasRole } from "@/modules/shared/security/middlewares";
import { whenHasRoleButNotOthers } from "@/modules/shared/security/middlewares/whenHasRoleButNotOthers";

import { isOwnerOfAccount } from "../../account/security/isOwnerOfAccount.security";

import { isGestionnaireOfMaisonMereAAP } from "./isGestionnaireOfMaisonMereAAP.security";
import { isOwnerOfOrganism } from "./isOwnerOfOrganism";

// Règles d'accès composées propres au module organism. Un seul consommateur
// (`organism.resolvers.ts`) : elles ne sont pas promues dans `shared/presets`.

export const isAdminOrGestionnaireOfMaisonMereAAP = [
  hasRole(["admin", "gestion_maison_mere_aap"]),
  whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
];

export const isAdminOrGestionnaireOfMaisonMereAAPOfOrganismOrOwnerOfOrganism = [
  hasRole(["admin", "gestion_maison_mere_aap", "manage_candidacy"]),
  whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
  whenHasRoleButNotOthers(
    "manage_candidacy",
    ["admin", "gestion_maison_mere_aap"],
    isOwnerOfOrganism,
  ),
];

export const isAdminOrGestionnaireVaeCollective = [
  hasRole(["admin", "manage_vae_collective"]),
];

export const isAdminOrGestionnaireOfMaisonMereAAPOrOwnerOfAccount = [
  hasRole(["admin", "gestion_maison_mere_aap", "manage_candidacy"]),
  whenHasRole("gestion_maison_mere_aap", isGestionnaireOfMaisonMereAAP),
  whenHasRoleButNotOthers(
    "manage_candidacy",
    ["admin", "gestion_maison_mere_aap"],
    isOwnerOfAccount,
  ),
];
