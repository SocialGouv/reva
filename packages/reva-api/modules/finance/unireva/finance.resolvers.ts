import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { PaymentRequest } from "@prisma/client";
import mercurius from "mercurius";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { Candidacy } from "../../candidacy/candidacy.types";
import { confirmPaymentRequest } from "./features/confirmPaymentRequest";
import { createOrUpdatePaymentRequestForCandidacy } from "./features/createOrUpdatePaymentRequestForCandidacy";
import { getFundingRequest } from "./features/getFundingRequest";
import { getPaymentRequestByCandidacyId } from "./features/getPaymentRequestByCandidacyId";
import { resolversSecurityMap } from "./security";
import { getFundingRequestByCandidacyId } from "./features/getFundingRequestByCandidacyId";

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
        .map((fundingRequestInformations: any) => {
          return {
            fundingRequest: fundingRequestInformations.fundingRequest,
            training: {
              ...fundingRequestInformations.training,
              mandatoryTrainings:
                fundingRequestInformations.training.mandatoryTrainings,
            },
          };
        })
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
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
      const result = await createOrUpdatePaymentRequestForCandidacy({
        candidacyId,
        paymentRequest,
      });
      if (result.isRight()) {
        await logCandidacyAuditEvent({
          candidacyId,
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
          eventType: "PAYMENT_REQUEST_CREATED_OR_UPDATED",
        });
      }

      return result
        .mapLeft((error) =>
          error.errors?.length
            ? new mercurius.ErrorWithProps(error.errors[0], {
                businessErrors: error.errors,
              })
            : new mercurius.ErrorWithProps(error.message, error),
        )
        .extract();
    },
    candidacy_confirmPaymentRequest: async (
      _: unknown,
      { candidacyId }: { candidacyId: string },
      context: GraphqlContext,
    ) => {
      const result = await confirmPaymentRequest({
        candidacyId: candidacyId,
      });

      if (result.isRight()) {
        await logCandidacyAuditEvent({
          candidacyId,
          userKeycloakId: context.auth.userInfo?.sub,
          userEmail: context.auth.userInfo?.email,
          userRoles: context.auth.userInfo?.realm_access?.roles || [],
          eventType: "PAYMENT_REQUEST_CONFIRMED",
        });
      }

      return result
        .mapLeft((error) =>
          error.errors?.length
            ? new mercurius.ErrorWithProps(error.errors[0], {
                businessErrors: error.errors,
              })
            : new mercurius.ErrorWithProps(error.message, error),
        )
        .extract();
    },
  },
};

export const financeResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
