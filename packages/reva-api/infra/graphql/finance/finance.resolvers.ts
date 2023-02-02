import { PaymentRequest } from "@prisma/client";
import mercurius from "mercurius";

import { Role } from "../../../domain/types/account";
import { Candidacy } from "../../../domain/types/candidacy";
import * as candidaciesDb from "../../database/postgres/candidacies";
import * as candidatesDb from "../../database/postgres/candidates";
import * as fundingRequestBatchesDb from "../../database/postgres/fundingRequestBatches";
import * as fundingRequestsDb from "../../database/postgres/fundingRequests";
import * as paymentRequestsDb from "../../database/postgres/paymentRequest";
import * as paymentRequestBatchesDb from "../../database/postgres/paymentRequestBatches";
import { confirmPaymentRequest } from "./features/confirmPaymentRequest";
import { createFundingRequest } from "./features/createFundingRequest";
import { createOrUpdatePaymentRequestForCandidacy } from "./features/createOrUpdatePaymentRequestForCandidacy";
import { getFundingRequest } from "./features/getFundingRequest";
import { getPaymentRequestByCandidacyId } from "./features/getPaymentRequestByCandidacyId";

export const financeResolvers = {
  Candidacy: {
    paymentRequest: async (
      parent: Candidacy,
      _: unknown,
      context: { auth: { hasRole: (role: Role) => boolean } }
    ) => {
      const result = await getPaymentRequestByCandidacyId({
        hasRole: context.auth.hasRole,
        getPaymentRequestByCandidacyId:
          paymentRequestsDb.getPaymentRequestByCandidacyId,
      })({ candidacyId: parent.id });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .map((v) => v.extractNullable())
        .extract();
    },
  },
  Query: {
    candidate_getFundingRequest: async (
      _: unknown,
      params: { candidacyId: string },
      context: { auth: any }
    ) => {
      const result = await getFundingRequest({
        hasRole: context.auth.hasRole,
        getCandidacyFromId: candidaciesDb.getCandidacyFromId,
        getFundingRequestFromCandidacyId: fundingRequestsDb.getFundingRequest,
      })({ candidacyId: params.candidacyId });

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
      context: { auth: { hasRole: (role: Role) => boolean } }
    ) => {
      const result = await createOrUpdatePaymentRequestForCandidacy({
        hasRole: context.auth.hasRole,
        getFundingRequestByCandidacyId: fundingRequestsDb.getFundingRequest,
        getPaymentRequestByCandidacyId:
          paymentRequestsDb.getPaymentRequestByCandidacyId,
        createPaymentRequest: paymentRequestsDb.createPaymentRequest,
        updatePaymentRequest: paymentRequestsDb.updatePaymentRequest,
      })({
        candidacyId,
        paymentRequest,
      });

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidacy_confirmPaymentRequest: async (
      _: unknown,
      { candidacyId }: { candidacyId: string },
      context: { auth: { hasRole: (role: Role) => boolean } }
    ) => {
      const result = await confirmPaymentRequest({
        hasRole: context.auth.hasRole,
        existsCandidacyWithActiveStatus:
          candidaciesDb.existsCandidacyWithActiveStatus,
        getPaymentRequestByCandidacyId:
          paymentRequestsDb.getPaymentRequestByCandidacyId,
        updateCandidacyStatus: candidaciesDb.updateCandidacyStatus,
        createPaymentRequestBatch:
          paymentRequestBatchesDb.createPaymentRequestBatch,
        getFundingRequestByCandidacyId: fundingRequestsDb.getFundingRequest,
        getCandidacyFromId: candidaciesDb.getCandidacyFromId,
      })({
        candidacyId: candidacyId,
      });

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidate_createFundingRequest: async (
      _: unknown,
      params: { candidacyId: string; fundingRequest: any },
      context: { auth: any }
    ) => {
      const result = await createFundingRequest({
        createFundingRequest: fundingRequestsDb.createFundingRequest,
        createFundingRequestBatch:
          fundingRequestBatchesDb.createFundingRequestBatch,
        existsCandidacyWithActiveStatuses:
          candidaciesDb.existsCandidacyWithActiveStatuses,
        getCandidacyFromId: candidaciesDb.getCandidacyFromId,
        hasRole: context.auth.hasRole,
        getCandidateByCandidacyId: candidatesDb.getCandidateByCandidacyId,
      })(params);

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
  },
};
