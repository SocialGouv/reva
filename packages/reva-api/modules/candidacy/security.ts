import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
  isAdminOrManager,
  isCandidacyCompanion,
  isCandidate,
} from "../shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "Query.getCandidacies": isAdminOrManager,

  "Mutation.*": defaultSecurity, // forbidden

  // Mutations candidat
  "Mutation.candidacy_createCandidacy": isCandidate,
  "Mutation.candidacy_updateContact": isCandidate,
  "Mutation.candidacy_updateCertification": isCandidate,
  "Mutation.candidacy_updateGoals": isCandidate,
  "Mutation.candidacy_updateExperience": isCandidate,
  "Mutation.candidacy_removeExperience": isCandidate,
  "Mutation.candidacy_addExperience": isCandidate,
  "Mutation.candidacy_selectOrganism": isCandidate,
  "Mutation.candidacy_submitCandidacy": isCandidate,
  "Mutation.candidacy_confirmTrainingForm": isCandidate,

  // Mutation manager
  "Mutation.candidacy_takeOver": isCandidacyCompanion,

  // Mutations manager ou admin
  "Mutation.candidacy_deleteById": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_archiveById": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_unarchiveById": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_updateAppointmentInformations":
    isAdminOrCandidacyCompanion,
  "Mutation.candidacy_submitTrainingForm": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_dropOut": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_updateAdmissibility": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_createOrUpdatePaymentRequest":
    isAdminOrCandidacyCompanion,
  "Mutation.candidacy_confirmPaymentRequest": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_updateExamInfo": isAdminOrCandidacyCompanion,
};
