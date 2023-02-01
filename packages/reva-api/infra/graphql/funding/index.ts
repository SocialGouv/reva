import { PaymentRequest } from "@prisma/client";
import mercurius from "mercurius";

import { confirmPaymentRequest } from "../../../domain/features/confirmPaymentRequest";
import { createOrUpdatePaymentRequestForCandidacy } from "../../../domain/features/createOrUpdatePaymentRequestForCandidacy";
import { getPaymentRequestByCandidacyId } from "../../../domain/features/getPaymentRequestByCandidacyId";
import { Role } from "../../../domain/types/account";
import { Candidacy } from "../../../domain/types/candidacy";
import * as candidacyDb from "../../database/postgres/candidacies";
import * as fundingRequestDb from "../../database/postgres/fundingRequests";
import * as paymentRequestDb from "../../database/postgres/paymentRequest";
import * as paymentRequestBatchDb from "../../database/postgres/paymentRequestBatches";

export const resolvers = {
  Candidacy: {
    paymentRequest: async (
      parent: Candidacy,
      _: unknown,
      context: { auth: { hasRole: (role: Role) => boolean } }
    ) => {
      const result = await getPaymentRequestByCandidacyId({
        hasRole: context.auth.hasRole,
        getPaymentRequestByCandidacyId:
          paymentRequestDb.getPaymentRequestByCandidacyId,
      })({ candidacyId: parent.id });
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .map((v) => v.extractNullable())
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
        getFundingRequestByCandidacyId: fundingRequestDb.getFundingRequest,
        getPaymentRequestByCandidacyId:
          paymentRequestDb.getPaymentRequestByCandidacyId,
        createPaymentRequest: paymentRequestDb.createPaymentRequest,
        updatePaymentRequest: paymentRequestDb.updatePaymentRequest,
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
          candidacyDb.existsCandidacyWithActiveStatus,
        getPaymentRequestByCandidacyId:
          paymentRequestDb.getPaymentRequestByCandidacyId,
        updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
        createPaymentRequestBatch:
          paymentRequestBatchDb.createPaymentRequestBatch,
        getFundingRequestByCandidacyId: fundingRequestDb.getFundingRequest,
        getCandidacyFromId: candidacyDb.getCandidacyFromId,
      })({
        candidacyId: candidacyId,
      });

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
  },
};
