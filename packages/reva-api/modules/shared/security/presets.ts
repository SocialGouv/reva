import {
  allowed,
  forbidden,
  hasNotRole,
  hasRole,
  isCandidacyOwner,
  whenHasRole,
} from "./middlewares";
import { isCandidateOwnerOfCandidacy } from "./middlewares/isCandidateOwnerOfCandidacy.security";
import { isFeasibilityManager } from "./middlewares/isFeasibilityManager";
import { isUserOwnerOfCandidate } from "./middlewares/isUserOwnerOfCandidate";

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

export const defaultSecurity = [forbidden];

export const isAnyone = [allowed];

export const isAdmin = [hasRole(["admin"])];

export const isAdminOrCertificationAuthority = [
  hasRole(["admin", "manage_feasibility"]),
];

export const isAdminCandidacyCompanionOrFeasibilityManager = [
  hasRole(["admin", "manage_candidacy", "manage_feasibility"]),
  whenHasRole("manage_candidacy", isCandidacyOwner),
  whenHasRole("manage_feasibility", isFeasibilityManager),
];

export const isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate = [
  hasRole(["admin", "manage_candidacy", "manage_feasibility", "candidate"]),
  whenHasRole("manage_candidacy", isCandidacyOwner),
  whenHasRole("manage_feasibility", isFeasibilityManager),
  whenHasRole("candidate", isCandidateOwnerOfCandidacy),
];

export const isOwnerOfCandidacy = [isCandidateOwnerOfCandidacy];

export const isOwnerOfCandidate = [isUserOwnerOfCandidate];

export const isOwnerOrCanManageCandidacy = [
  hasRole(["admin", "manage_candidacy", "candidate"]),
  whenHasRole("manage_candidacy", isCandidacyOwner),
  whenHasRole("candidate", isCandidateOwnerOfCandidacy),
];
