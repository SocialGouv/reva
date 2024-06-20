import { Prisma, SubscriptionRequestV2 } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";

export const buildSubscriptionFilters = (searchFilter: string) => {
  const containsFilter = (field: keyof SubscriptionRequestV2) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

  return [
    containsFilter("accountLastname"),
    containsFilter("accountFirstname"),
    containsFilter("accountEmail"),
    containsFilter("companyName"),
  ];
};

export const getSubscriptionRequestV2s = async ({
  limit,
  offset,
  status,
  searchFilter,
}: {
  limit?: number;
  offset?: number;
  status?: SubscriptionRequestStatus;
  searchFilter?: string;
}): Promise<PaginatedListResult<SubscriptionRequestV2>> => {
  const querySubscriptionRequestV2s: Prisma.SubscriptionRequestV2FindManyArgs =
    {
      where: {
        status,
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
      skip: offset,
    };

  const queryCount: Prisma.SubscriptionRequestV2CountArgs = {
    where: {
      status,
    },
  };

  if (searchFilter && searchFilter.length > 0) {
    const filters = buildSubscriptionFilters(searchFilter);

    querySubscriptionRequestV2s.where = {
      ...querySubscriptionRequestV2s.where,
      OR: filters,
    };

    queryCount.where = {
      ...queryCount.where,
      OR: filters,
    };
  }

  const subscriptionRequestV2s =
    await prismaClient.subscriptionRequestV2.findMany(
      querySubscriptionRequestV2s,
    );
  const count = await prismaClient.subscriptionRequestV2.count(queryCount);

  return {
    rows: subscriptionRequestV2s,
    info: processPaginationInfo({
      totalRows: count,
      limit: 10,
      offset,
    }),
  };
};
