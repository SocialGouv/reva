import { hasRole } from "../security/hasRole";
import { isCandidacyOwner } from "../security/isCandidacyOwner";
import { whenHasRole } from "../security/whenHasRole";

const isAdminOrOwningManager = [
  hasRole(["admin", "manage_candidacy"]),
  whenHasRole("manage_candidacy", isCandidacyOwner),
];

// NB: les autres mutations sont accessibles au candidat
// Elles ne nécessitent pas de contrôle
export const resolversSecurityMap = {
  "Mutation.candidacy_deleteById": isAdminOrOwningManager,
  "Mutation.candidacy_archiveById": isAdminOrOwningManager,
  "Mutation.candidacy_updateAppointmentInformations": isAdminOrOwningManager,
  "Mutation.candidacy_takeOver": isAdminOrOwningManager,
  "Mutation.candidacy_submitTrainingForm": isAdminOrOwningManager,
  "Mutation.candidacy_dropOut": isAdminOrOwningManager,
  "Mutation.candidacy_updateAdmissibility": [hasRole(["admin", "manage_candidacy"])],
  "Mutation.candidacy_createOrUpdatePaymentRequest": [hasRole(["admin", "manage_candidacy"])],
  "Mutation.candidacy_confirmPaymentRequest": [hasRole(["admin", "manage_candidacy"])],
};
