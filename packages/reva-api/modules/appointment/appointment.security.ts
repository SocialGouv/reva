import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
  isAdminOrCanManageAppointment,
  isOwnerOrCanManageCandidacy,
  isOwnerOrCanManageAppointment,
} from "@/modules/shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "Query.*": defaultSecurity,
  "Mutation.*": defaultSecurity,

  "Query.appointment_getAppointmentById": isOwnerOrCanManageAppointment,

  "Mutation.appointment_createAppointment": isAdminOrCandidacyCompanion,
  "Mutation.appointment_updateAppointment": isAdminOrCanManageAppointment,
  "Mutation.appointment_deleteAppointment": isAdminOrCanManageAppointment,
  "Candidacy.appointments": isOwnerOrCanManageCandidacy,
};
