import {
  defaultSecurity,
  isAdminOrManager,
  isAdminOrOwningManager,
  isCandidate,
  isOwningManager,
} from "../security/presets";

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
  "Mutation.candidacy_takeOver": isOwningManager,

  // Mutations manager ou admin
  "Mutation.candidacy_deleteById": isAdminOrOwningManager,
  "Mutation.candidacy_archiveById": isAdminOrOwningManager,
  "Mutation.candidacy_unarchiveById": isAdminOrOwningManager,
  "Mutation.candidacy_updateAppointmentInformations": isAdminOrOwningManager,
  "Mutation.candidacy_submitTrainingForm": isAdminOrOwningManager,
  "Mutation.candidacy_dropOut": isAdminOrOwningManager,
  "Mutation.candidacy_updateAdmissibility": isAdminOrOwningManager,
  "Mutation.candidacy_createOrUpdatePaymentRequest": isAdminOrOwningManager,
  "Mutation.candidacy_confirmPaymentRequest": isAdminOrOwningManager,
  "Mutation.candidacy_updateExamInfo": isAdminOrOwningManager,
};
