import {
  allowed,
  forbidden,
  hasNotRole,
  hasRole,
  isCandidacyOwner,
  whenHasRole,
} from "./middlewares";

export const isAdminOrManager = [hasRole(["admin", "manage_candidacy"])];

export const isAdminOrCandidacyCompanion = [
  hasRole(["admin", "manage_candidacy"]),
  whenHasRole("manage_candidacy", isCandidacyOwner),
];

export const isCandidacyCompanion = [
  hasNotRole(["admin"]),
  hasRole(["manage_candidacy"]),
  whenHasRole("manage_candidacy", isCandidacyOwner),
];

export const isCandidate = [
  hasNotRole(["admin", "manage_candidacy", "manage_feasibility"]),
];

export const defaultSecurity = [forbidden()];

export const isAnyone = [allowed()];

export const isAdmin = [hasRole(["admin"])];

export const isCertificationAuthority = [hasRole(["manage_feasibility"])];
