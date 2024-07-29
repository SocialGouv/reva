import { hasRole } from "../../shared/security/middlewares";
import { isAdminOrCandidacyCompanion } from "../../shared/security/presets";

export const resolversSecurityMap = {
  // Mutations manager ou admin
  "Mutation.candidacy_createOrUpdatePaymentRequest":
    isAdminOrCandidacyCompanion,

  "Candidacy.paymentRequest": [hasRole(["admin", "manage_candidacy"])],
};
