import pino from "pino";
import { Left, Right } from "purify-ts";

import { PaymentRequestBatch } from "../../../domain/types/candidacy";
import { prismaClient } from "./client";

const logger = pino();

export const createPaymentRequestBatch = async (params: {
  paymentRequestId: string;
  content: object;
}) => {
  try {
    return Right(
      (await prismaClient.paymentRequestBatch.create({
        data: { ...params },
      })) as unknown as PaymentRequestBatch
    );
  } catch (e) {
    logger.error(e);
    return Left("error while creating payment request batch");
  }
};
