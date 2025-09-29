import {
  allowed,
  forbidden,
  hasNotRole,
  hasRole,
  isCandidacyOwner,
  whenHasRole,
  whenHasRoleButNotOthers,
} from "./middlewares";
import { getIsCertificationAuthorityAccountOrLocalAccountStructureMember } from "./middlewares/getIsCertificationAuthorityAccountOrLocalAccountStructureMember.security";
import { getIsCertificationAuthorityStructureMember } from "./middlewares/getIsCertificationAuthorityStructureMember.security";
import { getIsCertificationAuthorityStructureRegistryManagerMember } from "./middlewares/getIsCertificationAuthorityStructureRegistryManagerMember.security";
import { isCandidateOwnerOfCandidacy } from "./middlewares/isCandidateOwnerOfCandidacy.security";
import { isCertificationAuthorityLocalAccountManager } from "./middlewares/isCertificationAuthorityLocalAccountManager";
import { isCertificationAuthorityLocalAccountOwner } from "./middlewares/isCertificationAuthorityLocalAccountOwner";
import { isCertificationAuthorityOwner } from "./middlewares/isCertificationAuthorityOwner";
import { isCertificationRegistryManagerOfCertification } from "./middlewares/isCertificationRegistryManagerOfCertification.security";
import { isFeasibilityManager } from "./middlewares/isFeasibilityManager";
import { isGestionnaireOfCommanditaireVaeCollective } from "./middlewares/isGestionnaireOfCommanditaireVaeCollective";
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
    isCertificationAuthorityLocalAccountManager,
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

export const isAdminOrCertificationRegistryManagerOfCertificationOrIsCertificationAuthorityStructureMember =
  [
    hasRole(["admin", "manage_feasibility", "manage_certification_registry"]),

    whenHasRole(
      "manage_feasibility",
      getIsCertificationAuthorityStructureMember,
    ),
    whenHasRole(
      "manage_certification_registry",
      isCertificationRegistryManagerOfCertification,
    ),
  ];

export const isAdminOrIsCertificationAuthorityAccountOrLocalAccountStructureMember =
  [
    hasRole(["admin", "manage_feasibility"]),
    whenHasRole(
      "manage_feasibility",
      getIsCertificationAuthorityAccountOrLocalAccountStructureMember,
    ),
  ];

export const isAdminOrIsCertificationAuthorityStructureRegistryManagerMember = [
  hasRole(["admin", "manage_certification_registry"]),
  whenHasRole(
    "manage_certification_registry",
    getIsCertificationAuthorityStructureRegistryManagerMember,
  ),
];

export const isAdminOrIsCertificationAuthorityStructureMember = [
  hasRole(["admin", "manage_feasibility", "manage_certification_registry"]),
  whenHasRole("manage_feasibility", getIsCertificationAuthorityStructureMember),
  whenHasRole(
    "manage_certification_registry",
    getIsCertificationAuthorityStructureMember,
  ),
];

export const isAdminOrGestionnaireOfCommanditaireVaeCollective = [
  hasRole(["admin", "manage_vae_collective"]),
  whenHasRole(
    "manage_vae_collective",
    isGestionnaireOfCommanditaireVaeCollective,
  ),
];

export const isAdminOrCertificationAuthorityLocalAccountManagerOrCertificationAuthorityLocalAccountOwner =
  [
    hasRole([
      "admin",
      "manage_certification_authority_local_account",
      "manage_feasibility",
    ]),
    whenHasRole(
      "manage_certification_authority_local_account",
      isCertificationAuthorityLocalAccountManager,
    ),
    whenHasRoleButNotOthers(
      "manage_feasibility",
      ["manage_certification_authority_local_account"],
      isCertificationAuthorityLocalAccountOwner,
    ),
  ];
