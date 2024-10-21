import { isAdminOrCandidacyCompanion } from "../../shared/security/presets";

export const resolversSecurityMap = {
  "Mutation.candidacy_createFundingRequestUnifvae": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_createOrUpdatePaymentRequestUnifvae":
    isAdminOrCandidacyCompanion,

  "Candidacy.fundingRequestUnifvae": isAdminOrCandidacyCompanion,
  "Candidacy.paymentRequestUnifvae": isAdminOrCandidacyCompanion,
};
