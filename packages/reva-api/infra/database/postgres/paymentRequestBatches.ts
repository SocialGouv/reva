import { Left, Right } from "purify-ts";

import { PaymentRequestBatch } from "../../../domain/types/candidacy";
import { logger } from "../../logger";
import { prismaClient } from "./client";

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
