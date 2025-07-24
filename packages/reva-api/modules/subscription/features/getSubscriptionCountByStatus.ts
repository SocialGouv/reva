import {
  StatutValidationInformationsJuridiquesMaisonMereAAP,
  SubscriptionRequestStatus,
} from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { buildMaisonMereFilters } from "../../organism/features/getMaisonMereAAPs";

import { buildSubscriptionFilters } from "./getSubscriptionRequests";

export const getSubscriptionCountByStatus = async ({
  searchFilter,
}: {
  searchFilter?: string;
}) => {
  const querySubscriptionCount = (status: SubscriptionRequestStatus) =>
    prismaClient.subscriptionRequest.count({
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
        ...(searchFilter && buildMaisonMereFilters(searchFilter)),
      },
    });

  const [
    PENDING_SUBSCRIPTION,
    REJECTED_SUBSCRIPTION,
    PENDING_LEGAL_VERIFICATION,
    NEED_LEGAL_VERIFICATION,
    APPROVED,
  ] = await Promise.all([
    querySubscriptionCount("PENDING"),
    querySubscriptionCount("REJECTED"),
    queryMaisonMereCount("EN_ATTENTE_DE_VERIFICATION"),
    queryMaisonMereCount("A_METTRE_A_JOUR"),
    queryMaisonMereCount("A_JOUR"),
  ]);

  return {
    PENDING_SUBSCRIPTION,
    REJECTED_SUBSCRIPTION,
    PENDING_LEGAL_VERIFICATION,
    NEED_LEGAL_VERIFICATION,
    APPROVED,
  };
};
