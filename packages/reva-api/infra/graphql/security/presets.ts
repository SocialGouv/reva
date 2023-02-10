import {
  forbidden,
  hasNotRole,
  hasRole,
  isCandidacyOwner,
  whenHasRole,
  allowed,
} from "./middlewares";

export const isAdminOrOwningManager = [
  hasRole(["admin", "manage_candidacy"]),
  whenHasRole("manage_candidacy", isCandidacyOwner),
];

export const isOwningManager = [
  hasNotRole(["admin"]),
  hasRole(["manage_candidacy"]),
  whenHasRole("manage_candidacy", isCandidacyOwner),
];

export const isCandidate = [hasNotRole(["admin", "manage_candidacy"])];

export const defaultSecurity = [forbidden()];

export const isAnyone = [allowed()];

export const isAdmin = [hasRole(["admin"])];
