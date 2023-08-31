import { isAdminOrCandidacyCompanion } from "../../shared/security/presets";

export const resolversSecurityMap = {
  // Mutations manager ou admin
  "Mutation.candidacy_createOrUpdatePaymentRequest":
    isAdminOrCandidacyCompanion,
};
