import {
  hasRole,
  isCandidacyOwner,
  whenHasRole,
} from "../../shared/security/middlewares";
import {
  defaultSecurity,
  isAdmin,
  isAdminOrCandidacyCompanion,
  isAdminOrManager,
  isCandidacyCompanion,
} from "../../shared/security/presets";
import { canAccessCandidacy } from "./canAccessCandidacy.security";
import { isCandidateOwnerOfCandidacy } from "./isCandidateOwnerOfCandidacy.security";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "Query.getCandidacies": isAdminOrManager,

  "Query.getCandidacyById": [canAccessCandidacy],

  "Mutation.*": defaultSecurity, // forbidden

  // Mutations candidat
  "Mutation.candidacy_updateContact": [isCandidateOwnerOfCandidacy],
  "Mutation.candidacy_updateCertification": [isCandidateOwnerOfCandidacy],
  "Mutation.candidacy_updateCertificationWithinOrganismScope":
    isAdminOrCandidacyCompanion,
  "Mutation.candidacy_updateGoals": [isCandidateOwnerOfCandidacy],
  "Mutation.candidacy_updateExperience": [
    hasRole(["admin", "manage_candidacy", "candidate"]),
    whenHasRole("candidate", isCandidateOwnerOfCandidacy),
    whenHasRole("manage_candidacy", isCandidacyOwner),
  ],
  "Mutation.candidacy_removeExperience": [isCandidateOwnerOfCandidacy],
  "Mutation.candidacy_addExperience": [
    hasRole(["admin", "manage_candidacy", "candidate"]),
    whenHasRole("candidate", isCandidateOwnerOfCandidacy),
    whenHasRole("manage_candidacy", isCandidacyOwner),
  ],
  "Mutation.candidacy_selectOrganism": [isCandidateOwnerOfCandidacy],
  "Mutation.candidacy_submitCandidacy": [isCandidateOwnerOfCandidacy],
  "Mutation.candidacy_confirmTrainingForm": [isCandidateOwnerOfCandidacy],

  // Mutation manager
  "Mutation.candidacy_takeOver": isCandidacyCompanion,

  // Mutations manager ou admin
  "Mutation.candidacy_deleteById": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_archiveById": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_unarchiveById": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_updateAppointmentInformations":
    isAdminOrCandidacyCompanion,
  "Mutation.candidacy_submitTypologyForm": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_submitTrainingForm": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_dropOut": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_cancelDropOutById": isAdmin,
  "Mutation.candidacy_updateAdmissibility": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_updateAdmissibilityFvae": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_createOrUpdatePaymentRequest":
    isAdminOrCandidacyCompanion,
  "Mutation.candidacy_confirmPaymentRequest": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_setReadyForJuryEstimatedAt": isAdminOrCandidacyCompanion,
};
