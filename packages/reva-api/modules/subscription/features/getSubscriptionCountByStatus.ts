import {
  StatutValidationInformationsJuridiquesMaisonMereAAP,
  SubscriptionRequestStatus,
} from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const getSubscriptionCountByStatus = async ({
  searchFilter,
}: {
  searchFilter?: string;
}) => {
  const querySubscriptionCount = (status: SubscriptionRequestStatus) =>
    prismaClient.subscriptionRequestV2.count({
      where: {
        status,
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

  return {
    PENDING_SUBSCRIPTION,
    REJECTED_SUBSCRIPTION,
    PENDING_LEGAL_VERIFICATION,
    UP_TO_DATE,
  };
};
