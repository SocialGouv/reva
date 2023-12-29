import { MaisonMereAAP, Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";

const buildContainsFilterClause =
  (searchFilter: string) => (field: string) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

export const getMaisonMereAAPs = async ({
  limit = 10,
  offset = 0,
  searchFilter,
}: {
  limit?: number;
  offset?: number;
  searchFilter?: string;
}): Promise<PaginatedListResult<MaisonMereAAP>> => {
  const queryMaisonMereAAPs: Prisma.MaisonMereAAPFindManyArgs = {
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    skip: offset,
  };

  const queryCount: Prisma.MaisonMereAAPCountArgs = {};

  if (searchFilter) {
    const containsFilter = buildContainsFilterClause(searchFilter);

    const filters = [containsFilter("raisonSociale")];

    queryMaisonMereAAPs.where = {
      ...queryMaisonMereAAPs.where,
      OR: filters,
    };

    queryCount.where = {
      ...queryCount.where,
      OR: filters,
    };
  }

  const subscriptionRequest = await prismaClient.maisonMereAAP.findMany(
    queryMaisonMereAAPs
  );
  const count = await prismaClient.maisonMereAAP.count(queryCount);

  return {
    rows: subscriptionRequest,
    info: processPaginationInfo({
      totalRows: count,
      limit: limit,
      offset,
    }),
  };
};
