import {
  allowed,
  forbidden,
  hasNotRole,
  hasRole,
  isCandidacyOwner,
  whenHasRole,
} from "./middlewares";
import { isCandidateOwnerOfCandidacy } from "./middlewares/isCandidateOwnerOfCandidacy.security";
import { isCertificationAuthorityLocalAccountOwner } from "./middlewares/isCertificationAuthorityLocalAccountOwner";
import { isCertificationAuthorityOwner } from "./middlewares/isCertificationAuthorityOwner";
import { isCertificationAuthorityStructureMember } from "./middlewares/isCertificationAuthorityStructureMember.security";
import { isCertificationAuthorityStructureRegistryMember } from "./middlewares/isCertificationAuthorityStructureRegistryMember.security";
import { isCertificationRegistryManagerOfCertification } from "./middlewares/isCertificationRegistryManagerOfCertification.security";
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
export const isAdminOrCertificationAuthorityLocalAccountOwner = [
  hasRole(["admin", "manage_certification_authority_local_account"]),
  whenHasRole(
    "manage_certification_authority_local_account",
    isCertificationAuthorityLocalAccountOwner,
  ),
];

export const isAdminOrCertificationAuthorityOwner = [
  hasRole(["admin", "manage_certification_authority_local_account"]),
  whenHasRole(
    "manage_certification_authority_local_account",
    isCertificationAuthorityOwner,
  ),
];

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

export const isAdminOrOwnerOfCandidacy = [
  hasRole(["admin", "candidate"]),
  whenHasRole("candidate", isCandidateOwnerOfCandidacy),
];

export const isOwnerOfCandidate = [isUserOwnerOfCandidate];

export const isOwnerOrCanManageCandidacy = [
  hasRole(["admin", "manage_candidacy", "candidate"]),
  whenHasRole("manage_candidacy", isCandidacyOwner),
  whenHasRole("candidate", isCandidateOwnerOfCandidacy),
];

export const isAdminOrCertificationRegistryManagerOfCertification = [
  hasRole(["admin", "manage_certification_registry"]),
  whenHasRole(
    "manage_certification_registry",
    isCertificationRegistryManagerOfCertification,
  ),
];

export const isAdminOrIsCertificationAuthorityStructureMember = [
  hasRole(["admin", "manage_feasibility", "manage_certification_registry"]),
  whenHasRole("manage_feasibility", isCertificationAuthorityStructureMember),
  whenHasRole(
    "manage_certification_registry",
    isCertificationAuthorityStructureRegistryMember,
  ),
];
