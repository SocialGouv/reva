import { prismaClient } from "@/prisma/client";

import { PaymentRequest } from "../finance.types";

export const getPaymentRequestByCandidacyId = async (params: {
  candidacyId: string;
}) =>
  prismaClient.paymentRequest.findUnique({
    where: {
      candidacyId: params.candidacyId,
    },
  });

export const createPaymentRequest = async (params: {
  candidacyId: string;
  paymentRequest: PaymentRequest;
}) =>
  prismaClient.paymentRequest.create({
    data: {
      candidacyId: params.candidacyId,
      ...params.paymentRequest,
    },
  });

export const updatePaymentRequest = async (params: {
  paymentRequestId: string;
  paymentRequest: PaymentRequest;
}) =>
  prismaClient.paymentRequest.update({
    where: { id: params.paymentRequestId },
    data: {
      ...params.paymentRequest,
    },
  });
