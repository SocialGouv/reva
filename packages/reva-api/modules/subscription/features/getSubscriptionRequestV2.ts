import { prismaClient } from "../../../prisma/client";

export const getSubscriptionRequestV2 = ({
  subscriptionRequestId,
}: {
  subscriptionRequestId: string;
}) =>
  prismaClient.subscriptionRequestV2.findUnique({
    where: { id: subscriptionRequestId },
  });
