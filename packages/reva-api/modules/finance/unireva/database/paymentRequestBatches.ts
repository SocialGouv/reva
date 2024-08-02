import { prismaClient } from "../../../../prisma/client";
import { PaymentRequestBatchContent } from "../finance.types";

export const createPaymentRequestBatch = async ({
  paymentRequestId,
  content,
}: {
  paymentRequestId: string;
  content: PaymentRequestBatchContent;
}) =>
  prismaClient.paymentRequestBatch.create({
    data: { paymentRequestId, content: content as object },
  });
