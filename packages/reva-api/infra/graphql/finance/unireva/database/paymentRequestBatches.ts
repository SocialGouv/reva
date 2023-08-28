import { Left, Right } from "purify-ts";

import { prismaClient } from "../../../../database/postgres/client";
import { logger } from "../../../../logger";
import { PaymentRequestBatch } from "../finance.types";

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
