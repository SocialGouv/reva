import { hasRole } from "../../shared/security/middlewares";
import {
  isAdminOrCandidacyCompanion,
  isAdminOrManager,
} from "../../shared/security/presets";

export const resolversSecurityMap = {
  "Query.candidate_getFundingRequest": [hasRole(["admin", "manage_candidacy"])],
  // Mutations manager ou admin
  "Mutation.candidacy_createOrUpdatePaymentRequest":
    isAdminOrCandidacyCompanion,

  "Mutation.candidacy_confirmPaymentRequest": isAdminOrCandidacyCompanion,

  "Candidacy.fundingRequest": isAdminOrManager,
  "Candidacy.paymentRequest": isAdminOrManager,
};
