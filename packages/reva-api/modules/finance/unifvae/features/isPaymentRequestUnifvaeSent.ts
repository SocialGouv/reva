import { prismaClient } from "../../../../prisma/client";

export const isPaymentRequestUnifvaeSent = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const paymentRequest = await prismaClient.paymentRequestUnifvae.findUnique({
    where: { candidacyId },
  });
  return !!paymentRequest?.confirmedAt;
};
