import { composeResolvers } from "@graphql-tools/resolvers-composition";
import mercurius from "mercurius";

import { prismaClient } from "../../../prisma/client";
import { CandidacyBusinessEvent } from "../../candidacy/candidacy.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import {
  createFundingRequestUnifvae,
  createOrUpdatePaymentRequestUnifvae,
  getFundingRequestUnifvaeFromCandidacyId,
  getPaymentRequestUnifvaeFromCandidacyId,
} from "./features/finance.unifvae.features";
import { logFundingRequestUnifvaeEvent } from "./logFundingRequestUnifvaeEvent";
import { applyBusinessValidationRules } from "./validation";
import { Decimal } from "@prisma/client/runtime/library";
import { resolversSecurityMap } from "./security";

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
  },

  Query: {},
  Mutation: {
    candidacy_createFundingRequestUnifvae: async (
      _: unknown,
      payload: FundingRequestUnifvaeInput,
      context: GraphqlContext,
    ) => {
      const candidacy = await prismaClient.candidacy.findUnique({
        where: { id: payload.candidacyId },
      });
      if (!candidacy) {
        return new mercurius.ErrorWithProps(
          `Candidacy not found: ${payload.candidacyId}`,
        );
      }
      if (candidacy.financeModule !== "unifvae") {
        return new mercurius.ErrorWithProps(
          `Cannot create FundingRequestUnifvae: candidacy.financeModule is "${candidacy.financeModule}"`,
        );
      }
      const fundingRequestCompleted: FundingRequestUnifvaeInputCompleted = {
        candidacyId: payload.candidacyId,
        isCertificationPartial: !!candidacy?.isCertificationPartial,
        fundingRequest: {
          ...payload.fundingRequest,
        },
      };

      const validationErrors = await applyBusinessValidationRules({
        maximumTotalCostAllowed: new Decimal(3200),
        candidacyId: fundingRequestCompleted.candidacyId,
        isCertificationPartial: fundingRequestCompleted.isCertificationPartial,
        ...fundingRequestCompleted.fundingRequest,
      });
      if (validationErrors.length) {
        const businessErrors = validationErrors.map(({ fieldName, message }) =>
          fieldName === "GLOBAL" ? message : `input.${fieldName}: ${message}`,
        );
        return new mercurius.ErrorWithProps(businessErrors[0], {
          businessErrors,
        });
      }
      try {
        const fundreq = await createFundingRequestUnifvae({
          ...fundingRequestCompleted,
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth?.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
        });
        logFundingRequestUnifvaeEvent({
          context,
          eventType: CandidacyBusinessEvent.CREATED_FUNDING_REQUEST_UNIFVAE,
          candidacyId: payload.candidacyId,
          result: fundreq as Record<string, unknown>,
        });
        return fundreq;
      } catch (error: any) {
        logFundingRequestUnifvaeEvent({
          context,
          eventType: CandidacyBusinessEvent.CREATED_FUNDING_REQUEST_UNIFVAE,
          candidacyId: payload.candidacyId,
          result: new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            error.message,
          ),
        });
        return new mercurius.ErrorWithProps(error.message, error);
      }
    },
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

export const financeUnifvaeResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
