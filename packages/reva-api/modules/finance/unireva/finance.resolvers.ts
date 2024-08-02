import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { PaymentRequest } from "@prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { Candidacy } from "../../candidacy/candidacy.types";
import { confirmPaymentRequest } from "./features/confirmPaymentRequest";
import { createOrUpdatePaymentRequestForCandidacy } from "./features/createOrUpdatePaymentRequestForCandidacy";
import { getFundingRequest } from "./features/getFundingRequest";
import { getPaymentRequestByCandidacyId } from "./features/getPaymentRequestByCandidacyId";
import { resolversSecurityMap } from "./security";
import { getFundingRequestByCandidacyId } from "./features/getFundingRequestByCandidacyId";
import mercurius from "mercurius";

const unsafeResolvers = {
  Candidacy: {
    paymentRequest: (parent: Candidacy) =>
      getPaymentRequestByCandidacyId({
        candidacyId: parent.id,
      }),
    fundingRequest: ({ id: candidacyId }: Candidacy) =>
      getFundingRequestByCandidacyId({ candidacyId }),
  },
  Query: {
    candidate_getFundingRequest: async (
      _: unknown,
      params: { candidacyId: string },
    ) => {
      const result = await getFundingRequest({
        candidacyId: params.candidacyId,
      });

      return result
        ? {
            fundingRequest: result.fundingRequest,
            training: {
              ...result.training,
              mandatoryTrainings: result.training.mandatoryTrainings,
            },
          }
        : null;
    },
  },
  Mutation: {
    candidacy_createOrUpdatePaymentRequest: async (
      _: unknown,
      {
        candidacyId,
        paymentRequest,
      }: { candidacyId: string; paymentRequest: PaymentRequest },
      context: GraphqlContext,
    ) => {
      try {
        const result = await createOrUpdatePaymentRequestForCandidacy({
          candidacyId,
          paymentRequest,
        });
        await logCandidacyAuditEvent({
          candidacyId,
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
          eventType: "PAYMENT_REQUEST_CREATED_OR_UPDATED",
        });

        return result;
      } catch (e: any) {
        if (e?.errors?.length) {
          throw new mercurius.ErrorWithProps(e.errors[0], {
            businessErrors: e.errors,
          });
        } else {
          throw new mercurius.ErrorWithProps(e.message, e);
        }
      }
    },
    candidacy_confirmPaymentRequest: async (
      _: unknown,
      { candidacyId }: { candidacyId: string },
      context: GraphqlContext,
    ) => {
      try {
        const result = await confirmPaymentRequest({
          candidacyId: candidacyId,
        });

        await logCandidacyAuditEvent({
          candidacyId,
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
          eventType: "PAYMENT_REQUEST_CONFIRMED",
        });

        return result;
      } catch (e: any) {
        if (e?.errors?.length) {
          throw new mercurius.ErrorWithProps(e.errors[0], {
            businessErrors: e.errors,
          });
        } else {
          throw new mercurius.ErrorWithProps(e.message, e);
        }
      }
    },
  },
};

export const financeResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
