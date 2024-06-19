import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

type SubscriptionStatusFilter =
  | "PENDING_SUBSCRIPTION"
  | "REJECTED_SUBSCRIPTION"
  | "PENDING_LEGAL_VERIFICATION"
  | "UP_TO_DATE";

export const getSubscriptionCountByStatus = async ({
  searchFilter,
}: {
  searchFilter?: string;
}) => {
  const SubscriptionCountByStatus: Record<SubscriptionStatusFilter, number> = {
    PENDING_SUBSCRIPTION: 0,
    REJECTED_SUBSCRIPTION: 0,
    PENDING_LEGAL_VERIFICATION: 0,
    UP_TO_DATE: 0,
  };

  return SubscriptionCountByStatus;
};
