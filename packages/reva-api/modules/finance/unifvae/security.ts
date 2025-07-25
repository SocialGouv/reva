import { isAdminOrCandidacyCompanion } from "@/modules/shared/security/presets";

export const resolversSecurityMap = {
  "Mutation.candidacy_createFundingRequestUnifvae": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_createOrUpdatePaymentRequestUnifvae":
    isAdminOrCandidacyCompanion,

  "Candidacy.fundingRequestUnifvae": isAdminOrCandidacyCompanion,
  "Candidacy.paymentRequestUnifvae": isAdminOrCandidacyCompanion,
  "Candidacy.isFundingRequestUnifvaeSent": isAdminOrCandidacyCompanion,
  "Candidacy.isPaymentRequestUnifvaeSent": isAdminOrCandidacyCompanion,
};
