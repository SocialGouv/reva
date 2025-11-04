import { hasRole } from "@/modules/shared/security/middlewares/hasRole";
import { isCandidateOwnerOfCandidacy } from "@/modules/shared/security/middlewares/isCandidateOwnerOfCandidacy.security";
import { whenHasRole } from "@/modules/shared/security/middlewares/whenHasRole";
import {
  defaultSecurity,
  isAdmin,
  isAdminOrCandidacyCompanion,
  isAdminOrManager,
  isAnyone,
  isCandidacyCompanion,
  isOwnerOfCandidacy,
  isAdminOrOwnerOfCandidate,
  isOwnerOrCanManageCandidacy,
} from "@/modules/shared/security/presets";

import { canAccessCandidacy } from "./canAccessCandidacy.security";

const isAdminOrOwnerOfCandidacy = [
  hasRole(["admin", "candidate"]),
  whenHasRole("candidate", isCandidateOwnerOfCandidacy),
];

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "Query.getCandidacies": isAdminOrManager,

  "Query.getCandidacyById": [canAccessCandidacy],
  "Query.candidacy_canAccessCandidacy": isAnyone,

  "Query.candidacy_searchOrganismsForCandidacyAsAdmin": isAdmin,

  "Mutation.*": defaultSecurity, // forbidden

  // Mutations candidat
  "Mutation.candidacy_updateContact": isAdminOrOwnerOfCandidate,

  "Mutation.candidacy_updateGoals": isAdminOrOwnerOfCandidacy,
  "Mutation.candidacy_updateExperience": isOwnerOrCanManageCandidacy,
  "Mutation.candidacy_addExperience": isOwnerOrCanManageCandidacy,
  "Mutation.candidacy_deleteExperience": isOwnerOrCanManageCandidacy,
  "Mutation.candidacy_selectOrganism": isAdminOrOwnerOfCandidacy,
  "Mutation.candidacy_selectOrganismAsAdmin": isAdmin,
  "Mutation.candidacy_submitCandidacy": isAdminOrOwnerOfCandidacy,
  "Mutation.candidacy_updateTypeAccompagnement": isAdminOrOwnerOfCandidacy,
  "Mutation.candidacy_setTypeAccompagnementToAutonome": isAdmin,

  // Mutation manager
  "Mutation.candidacy_takeOver": isCandidacyCompanion,

  // Mutations manager ou admin
  "Mutation.candidacy_archiveById": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_unarchiveById": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_updateAppointmentInformations":
    isAdminOrCandidacyCompanion,
  "Mutation.candidacy_submitTypologyForm": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_dropOut": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_validateDropOut": isAdmin,
  "Mutation.candidacy_cancelDropOutById": isAdmin,
  "Mutation.candidacy_createOrUpdatePaymentRequest":
    isAdminOrCandidacyCompanion,
  "Mutation.candidacy_confirmPaymentRequest": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_setReadyForJuryEstimatedAt": isOwnerOrCanManageCandidacy,
  "Mutation.candidacy_updateCandidateCandidacyDropoutDecision":
    isAdminOrOwnerOfCandidacy,
  "Mutation.candidacy_updateFinanceModule": isAdmin,
  "Mutation.candidacy_updateCandidacyInactifDecision": isOwnerOfCandidacy,
  "Mutation.candidacy_submitEndAccompagnement": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_updateCandidacyEndAccompagnementDecision":
    isAdminOrOwnerOfCandidacy,
};
