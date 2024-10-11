import {
  isAdminOrCandidacyCompanion,
  isAdminOrManager,
} from "../../shared/security/presets";

export const resolversSecurityMap = {
  "Mutation.candidacy_createFundingRequestUnifvae": isAdminOrCandidacyCompanion,
  "Mutation.candidacy_createOrUpdatePaymentRequestUnifvae":
    isAdminOrCandidacyCompanion,

  "Candidacy.fundingRequestUnifvae": isAdminOrManager,
  "Candidacy.paymentRequestUnifvae": isAdminOrManager,
};
