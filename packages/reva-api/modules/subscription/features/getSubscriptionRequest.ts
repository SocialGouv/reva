import { prismaClient } from "../../../prisma/client";

export const getSubscriptionRequest = ({
  subscriptionRequestId,
}: {
  subscriptionRequestId: string;
}) =>
  prismaClient.subscriptionRequest.findUnique({
    where: { id: subscriptionRequestId },
  });
