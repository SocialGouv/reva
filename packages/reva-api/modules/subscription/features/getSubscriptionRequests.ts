import { Prisma, SubscriptionRequest } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";

export const buildSubscriptionFilters = (searchFilter: string) => {
  const containsFilter = (field: keyof SubscriptionRequest) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

  return [
    containsFilter("accountLastname"),
    containsFilter("accountFirstname"),
    containsFilter("accountEmail"),
    containsFilter("companyName"),
    containsFilter("companySiret"),
  ];
};

export const getSubscriptionRequests = async ({
  limit,
  offset,
  status,
  searchFilter,
}: {
  limit?: number;
  offset?: number;
  status?: SubscriptionRequestStatus;
  searchFilter?: string;
}): Promise<PaginatedListResult<SubscriptionRequest>> => {
  const querySubscriptionRequests: Prisma.SubscriptionRequestFindManyArgs = {
    where: {
      status,
    },
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    skip: offset,
  };

  const queryCount: Prisma.SubscriptionRequestCountArgs = {
    where: {
      status,
    },
  };

  if (searchFilter && searchFilter.length > 0) {
    const filters = buildSubscriptionFilters(searchFilter);

    querySubscriptionRequests.where = {
      ...querySubscriptionRequests.where,
      OR: filters,
    };

    queryCount.where = {
      ...queryCount.where,
      OR: filters,
    };
  }

  const subscriptionRequests = await prismaClient.subscriptionRequest.findMany(
    querySubscriptionRequests,
  );
  const count = await prismaClient.subscriptionRequest.count(queryCount);

  return {
    rows: subscriptionRequests,
    info: processPaginationInfo({
      totalRows: count,
      limit: 10,
      offset,
    }),
  };
};
