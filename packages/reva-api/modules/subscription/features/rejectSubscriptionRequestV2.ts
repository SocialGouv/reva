import { prismaClient } from "../../../prisma/client";
import { sendRejectionEmail } from "../mail";

export const rejectSubscriptionRequestV2 = async ({
  subscriptionRequestId,
  reason,
  internalComment,
}: {
  subscriptionRequestId: string;
  reason: string;
  internalComment?: string;
}) => {
  const subscriptionRequest =
    await prismaClient.subscriptionRequestV2.findUnique({
      where: { id: subscriptionRequestId },
    });

  if (!subscriptionRequest) {
    throw new Error("Demande d'inscription non trouvée");
  }

  await prismaClient.subscriptionRequestV2.update({
    where: { id: subscriptionRequestId },
    data: { status: "REJECTED", rejectionReason: reason, internalComment },
  });

  await sendRejectionEmail({
    email: subscriptionRequest.accountEmail,
    reason,
  });

  return "Ok";
};
