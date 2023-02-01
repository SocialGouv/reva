import security from "../security";
const { hasRole, hasNotRole, whenHasRole, isCandidacyOwner } = security;

const isAdminOrOwningManager = [
  hasRole(["admin", "manage_candidacy"]),
  whenHasRole("manage_candidacy", isCandidacyOwner),
];

const isOwningManager = [
  hasNotRole(["admin"]),
  hasRole(["manage_candidacy"]),
  whenHasRole("manage_candidacy", isCandidacyOwner),
];

// NB: les autres mutations sont accessibles au candidat
// Elles ne nécessitent pas de contrôle
export const resolversSecurityMap = {
  "Mutation.candidacy_deleteById": isAdminOrOwningManager,
  "Mutation.candidacy_archiveById": isAdminOrOwningManager,
  "Mutation.candidacy_updateAppointmentInformations": isAdminOrOwningManager,
  "Mutation.candidacy_takeOver": isOwningManager,
  "Mutation.candidacy_submitTrainingForm": isAdminOrOwningManager,
  "Mutation.candidacy_dropOut": isAdminOrOwningManager,
  "Mutation.candidacy_updateAdmissibility": [hasRole(["admin", "manage_candidacy"])],
  "Mutation.candidacy_createOrUpdatePaymentRequest": [hasRole(["admin", "manage_candidacy"])],
  "Mutation.candidacy_confirmPaymentRequest": [hasRole(["admin", "manage_candidacy"])],
};
