import { prismaClient } from "../../../../prisma/client";

export const getPaymentRequestByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => prismaClient.paymentRequest.findUnique({ where: { candidacyId } });
