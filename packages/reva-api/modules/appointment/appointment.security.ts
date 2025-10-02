import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
  isOwnerOrCanManageCandidacy,
} from "@/modules/shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "Query.*": defaultSecurity,
  "Mutation.*": defaultSecurity,

  "Query.appointment_getAppointmentById": isOwnerOrCanManageCandidacy,

  "Mutation.appointment_createAppointment": isAdminOrCandidacyCompanion,
  "Mutation.appointment_updateAppointment": isAdminOrCandidacyCompanion,
  "Candidacy.appointments": isOwnerOrCanManageCandidacy,
};
