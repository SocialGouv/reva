import { prismaClient } from "../../../../prisma/client";

export const isPaymentRequestSent = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const paymentRequest = await prismaClient.paymentRequest.findUnique({
    where: { candidacyId },
  });
  return !!paymentRequest?.confirmedAt;
};
