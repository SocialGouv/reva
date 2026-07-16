import { isAdminOrCandidacyCompanion } from "@/modules/shared/security/presets";
import { withPolicies } from "@/modules/shared/security/withPolicies";

import {
  createOrUpdatePaymentRequestUnifvae,
  getFundingRequestUnifvaeFromCandidacyId,
  getPaymentRequestUnifvaeFromCandidacyId,
} from "./features/finance.unifvae.features";
import { isFundingRequestUnifvaeSent } from "./features/isFundingRequestUnifvaeSent";
import { isPaymentRequestUnifvaeSent } from "./features/isPaymentRequestUnifvaeSent";
const withSkillsAndTrainings = (f: any) =>
  f
    ? {
        ...f,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        basicSkills: f.basicSkills.map((bs) => ({
          id: bs.basicSkillId,
          label: bs.basicSkill.label,
        })),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        mandatoryTrainings: f.mandatoryTrainings.map((mt) => ({
          id: mt.trainingId,
          label: mt.training.label,
        })),
      }
    : null;

const unsafeResolvers = {
  Candidacy: {
    fundingRequestUnifvae: async ({ id: candidacyId }: { id: string }) =>
      withSkillsAndTrainings(
        await getFundingRequestUnifvaeFromCandidacyId(candidacyId),
      ),
    paymentRequestUnifvae: async ({ id: candidacyId }: { id: string }) =>
      getPaymentRequestUnifvaeFromCandidacyId(candidacyId),
    isFundingRequestUnifvaeSent: async ({ id: candidacyId }: { id: string }) =>
      isFundingRequestUnifvaeSent({ candidacyId }),
    isPaymentRequestUnifvaeSent: async ({ id: candidacyId }: { id: string }) =>
      isPaymentRequestUnifvaeSent({ candidacyId }),
  },

  Mutation: {
    candidacy_createOrUpdatePaymentRequestUnifvae: async (
      _: unknown,
      params: {
        candidacyId: string;
        paymentRequest: PaymentRequestUnifvaeInput;
      },
      context: GraphqlContext,
    ) =>
      createOrUpdatePaymentRequestUnifvae({
        ...params,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth?.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      }),
  },
};

export const financeUnifvaeResolvers = withPolicies(unsafeResolvers, {
  Candidacy: {
    fundingRequestUnifvae: isAdminOrCandidacyCompanion,
    paymentRequestUnifvae: isAdminOrCandidacyCompanion,
    isFundingRequestUnifvaeSent: isAdminOrCandidacyCompanion,
    isPaymentRequestUnifvaeSent: isAdminOrCandidacyCompanion,
  },
  Mutation: {
    candidacy_createOrUpdatePaymentRequestUnifvae: isAdminOrCandidacyCompanion,
  },
});
