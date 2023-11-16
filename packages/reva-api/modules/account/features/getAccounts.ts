import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
import { Account, AccountGroupFilter } from "../account.types";

const buildContainsFilterClause =
  (searchFilter: string) => (field: string) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

export const getAccounts = async (
  context: {
    hasRole: (role: string) => boolean;
  },
  params: {
    limit?: number;
    offset?: number;
    groupFilter?: AccountGroupFilter;
    searchFilter?: string;
  }
): Promise<PaginatedListResult<Account>> => {
  const { hasRole } = context;
  if (!hasRole("admin")) {
    throw new Error("Utilisateur non autorisé");
  }

  const { limit = 10, offset = 0, groupFilter, searchFilter } = params;

  const queryAccounts: Prisma.AccountFindManyArgs = {
    orderBy: [{ lastname: "asc" }],
    take: limit,
    skip: offset,
    include: { organism: true },
  };

  const queryCount: Prisma.AccountCountArgs = {};

  if (groupFilter == "organism") {
    queryAccounts.where = {
      ...queryAccounts.where,
      organismId: { not: null },
    };

    queryCount.where = {
      ...queryCount.where,
      organismId: { not: null },
    };
  } else if (groupFilter == "certification_authority") {
    queryAccounts.where = {
      ...queryAccounts.where,
      certificationAuthorityId: { not: null },
    };

    queryCount.where = {
      ...queryCount.where,
      certificationAuthorityId: { not: null },
    };
  }

  if (searchFilter && searchFilter.length > 0) {
    const containsFilter = buildContainsFilterClause(searchFilter);

    const filters = [
      containsFilter("firstname"),
      containsFilter("lastname"),
      containsFilter("email"),
      {
        organism: containsFilter("label"),
      },
    ];

    queryAccounts.where = {
      ...queryAccounts.where,
      OR: filters,
    };

    queryCount.where = {
      ...queryCount.where,
      OR: filters,
    };
  }

  const accounts = await prismaClient.account.findMany(queryAccounts);
  const count = await prismaClient.account.count(queryCount);

  return {
    rows: accounts,
    info: processPaginationInfo({
      totalRows: count,
      limit: 10,
      offset,
    }),
  };
};
