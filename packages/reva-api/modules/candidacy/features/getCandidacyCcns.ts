import { CandidacyConventionCollective, Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { Role } from "../../account/account.types";
import { processPaginationInfo } from "../../shared/list/pagination";

const buildContainsFilterClause =
  (searchFilter: string) => (field: string) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

export const getCandidacyCcns = async (
  context: {
    hasRole: (role: Role) => boolean;
  },
  params: {
    limit?: number;
    offset?: number;
    searchFilter?: string;
  }
): Promise<PaginatedListResult<CandidacyConventionCollective>> => {
  const { hasRole } = context;
  if (!(hasRole("admin") || hasRole("manage_candidacy"))) {
    throw new Error("Utilisateur non autorisé");
  }

  const { limit = 10, offset = 0, searchFilter } = params;

  const query: Prisma.CandidacyConventionCollectiveFindManyArgs = {
    orderBy: [{ idcc: "asc" }],
    take: limit,
    skip: offset,
  };

  const queryCount: Prisma.CandidacyConventionCollectiveCountArgs = {};

  query.where = {
    ...query.where,
  };

  queryCount.where = {
    ...queryCount.where,
  };

  if (searchFilter && searchFilter.length > 0) {
    const containsFilter = buildContainsFilterClause(searchFilter);

    const filters = [containsFilter("idcc"), containsFilter("label")];

    query.where = {
      ...query.where,
      OR: filters,
    };

    queryCount.where = {
      ...queryCount.where,
      OR: filters,
    };
  }

  const rows = await prismaClient.candidacyConventionCollective.findMany(query);
  const count = await prismaClient.candidacyConventionCollective.count(
    queryCount
  );

  return {
    rows: rows,
    info: processPaginationInfo({
      totalRows: count,
      limit: 10,
      offset,
    }),
  };
};
