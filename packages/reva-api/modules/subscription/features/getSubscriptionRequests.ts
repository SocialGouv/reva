import { Prisma, SubscriptionRequest } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";

const buildContainsFilterClause =
  (searchFilter: string) => (field: string) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

export const getSubscriptionRequests = async (
  context: {
    hasRole: (role: string) => boolean;
  },
  params: {
    limit?: number;
    offset?: number;
    status?: SubscriptionRequestStatus;
    searchFilter?: string;
  }
): Promise<PaginatedListResult<SubscriptionRequest>> => {
  const { hasRole } = context;
  if (!hasRole("admin")) {
    throw new Error("Utilisateur non autorisé");
  }

  const { limit = 10, offset = 0, status, searchFilter } = params;

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
    const containsFilter = buildContainsFilterClause(searchFilter);

    const filters = [
      containsFilter("accountLastname"),
      containsFilter("accountFirstname"),
      containsFilter("accountEmail"),
      containsFilter("companyName"),
    ];

    querySubscriptionRequests.where = {
      ...querySubscriptionRequests.where,
      OR: filters,
    };

    queryCount.where = {
      ...queryCount.where,
      OR: filters,
    };
  }

  const subscriptionRequest = await prismaClient.subscriptionRequest.findMany(
    querySubscriptionRequests
  );
  const count = await prismaClient.subscriptionRequest.count(queryCount);

  return {
    rows: subscriptionRequest,
    info: processPaginationInfo({
      totalRows: count,
      limit: 10,
      offset,
    }),
  };
};
