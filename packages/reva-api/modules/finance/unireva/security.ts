import { hasRole } from "@/modules/shared/security/middlewares";
import { isAdminOrCandidacyCompanion } from "@/modules/shared/security/presets";

export const resolversSecurityMap = {
  "Query.candidate_getFundingRequest": [hasRole(["admin", "manage_candidacy"])],
  // Mutations manager ou admin
  "Mutation.candidacy_createOrUpdatePaymentRequest":
    isAdminOrCandidacyCompanion,

  "Mutation.candidacy_confirmPaymentRequest": isAdminOrCandidacyCompanion,

  "Candidacy.fundingRequest": isAdminOrCandidacyCompanion,
  "Candidacy.paymentRequest": isAdminOrCandidacyCompanion,
  "Candidacy.isFundingRequestSent": isAdminOrCandidacyCompanion,
  "Candidacy.isPaymentRequestSent": isAdminOrCandidacyCompanion,
};
