import {
  StatutValidationInformationsJuridiquesMaisonMereAAP,
  SubscriptionRequestStatus,
} from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { buildMaisonMereFilters } from "../../organism/features/getMaisonMereAAPs";
import { buildSubscriptionFilters } from "./getSubscriptionRequestV2s";

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
  const querySubscriptionCount = (status: SubscriptionRequestStatus) =>
    prismaClient.subscriptionRequestV2.count({
      where: {
        status,
        ...(searchFilter && { OR: buildSubscriptionFilters(searchFilter) }),
      },
    });

  const queryMaisonMereCount = (
    status: StatutValidationInformationsJuridiquesMaisonMereAAP,
  ) =>
    prismaClient.maisonMereAAP.count({
      where: {
        AND: [
          {
            statutValidationInformationsJuridiquesMaisonMereAAP: status,
          },
        ],
        ...(searchFilter && { OR: buildMaisonMereFilters(searchFilter) }),
      },
    });

  const [
    PENDING_SUBSCRIPTION,
    REJECTED_SUBSCRIPTION,
    PENDING_LEGAL_VERIFICATION,
    UP_TO_DATE,
  ] = await Promise.all([
    querySubscriptionCount("PENDING"),
    querySubscriptionCount("REJECTED"),
    queryMaisonMereCount("EN_ATTENTE_DE_VERIFICATION"),
    queryMaisonMereCount("A_JOUR"),
  ]);

  const SubscriptionCountByStatus: Record<SubscriptionStatusFilter, number> = {
    PENDING_SUBSCRIPTION,
    REJECTED_SUBSCRIPTION,
    PENDING_LEGAL_VERIFICATION,
    UP_TO_DATE,
  };

  return SubscriptionCountByStatus;
};
