import { IFieldResolver } from "mercurius";

import { hasRole, whenHasRole } from "./middlewares";
import { Middleware } from "./withPolicies";

// Marqueur: "ce rôle est autorisé, sans contrôle d'ownership".
export const ALLOW = Symbol("allow");

// Un contrôle d'ownership: middleware appliqué conditionnellement à un rôle
// (même forme que ce qu'attend `whenHasRole`, ex. `isCandidacyOwner`).
type OwnershipCheck = (
  next: IFieldResolver<unknown>,
) => IFieldResolver<unknown>;

// Une règle d'accès: pour chaque rôle autorisé, soit `ALLOW` (aucun contrôle),
// soit un contrôle d'ownership à appliquer si l'appelant a ce rôle.
type Rules = Partial<Record<KeyCloakUserRole, OwnershipCheck | typeof ALLOW>>;

// Construit la même chaîne de middlewares que les presets écrits à la main:
//   [ hasRole(rôles autorisés),
//     ...whenHasRole(rôle, check) pour chaque rôle à ownership conditionnel,
//     ...extra (contrôles appliqués à tout appelant autorisé) ]
// Source unique {rôle: règle}: la liste de rôles et leurs contrôles ne peuvent plus diverger.
export function accessBy(rules: Rules, extra: Middleware[] = []): Middleware[] {
  const roles = Object.keys(rules) as KeyCloakUserRole[];
  const conditional = roles
    .filter((role) => rules[role] !== ALLOW)
    .map((role) => whenHasRole(role, rules[role] as OwnershipCheck));
  return [hasRole(roles), ...conditional, ...extra];
}
