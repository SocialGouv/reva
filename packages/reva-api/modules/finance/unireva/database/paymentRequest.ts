import { Either, Left, Maybe, Right } from "purify-ts";

import { logger } from "../../../../infra/logger";
import { prismaClient } from "../../../../prisma/client";
import { PaymentRequest } from "../finance.types";

export const getPaymentRequestByCandidacyId = async (params: {
  candidacyId: string;
}): Promise<Either<string, Maybe<PaymentRequest>>> => {
  try {
    const paymentRequest = await prismaClient.paymentRequest.findUnique({
      where: {
        candidacyId: params.candidacyId,
      },
    });

    return Right(Maybe.fromNullable(paymentRequest));
  } catch (e) {
    logger.error(e);
    return Left(
      `error while retrieving payment request for candidacy with id ${params.candidacyId}`
    );
  }
};

export const createPaymentRequest = async (params: {
  candidacyId: string;
  paymentRequest: PaymentRequest;
}): Promise<Either<string, PaymentRequest>> => {
  try {
    const paymentRequest = await prismaClient.paymentRequest.create({
      data: {
        candidacyId: params.candidacyId,
        ...params.paymentRequest,
      },
    });

    return Right(paymentRequest);
  } catch (e) {
    logger.error(e);
    return Left(
      `error while creating payment request for candidacy with id ${params.candidacyId}`
    );
  }
};

export const updatePaymentRequest = async (params: {
  paymentRequestId: string;
  paymentRequest: PaymentRequest;
}): Promise<Either<string, PaymentRequest>> => {
  try {
    const paymentRequest = await prismaClient.paymentRequest.update({
      where: { id: params.paymentRequestId },
      data: {
        ...params.paymentRequest,
      },
    });

    return Right(paymentRequest);
  } catch (e) {
    logger.error(e);
    return Left(
      `error while updating payment request with id ${params.paymentRequestId}`
    );
  }
};
