import {
  MaisonMereAAP,
  Prisma,
  type StatutValidationInformationsJuridiquesMaisonMereAAP,
} from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
// import { LegalValidationStatus } from "../organism.types";

const buildContainsFilterClause =
  (searchFilter: string) => (field: string) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

export const getMaisonMereAAPs = async ({
  limit = 10,
  offset = 0,
  searchFilter,
  legalValidationStatus,
}: {
  limit?: number;
  offset?: number;
  searchFilter?: string;
  legalValidationStatus?: StatutValidationInformationsJuridiquesMaisonMereAAP;
}): Promise<PaginatedListResult<MaisonMereAAP>> => {
  const queryMaisonMereAAPs: Prisma.MaisonMereAAPFindManyArgs = {
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    skip: offset,
  };

  const queryCount: Prisma.MaisonMereAAPCountArgs = {};

  if (searchFilter) {
    const containsFilter = buildContainsFilterClause(searchFilter);

    const filtersAccount = {
      gestionnaire: {
        OR: [
          containsFilter("firstname"),
          containsFilter("lastname"),
          containsFilter("email"),
        ],
      },
    };
    const filters = [containsFilter("raisonSociale"), filtersAccount];

    queryMaisonMereAAPs.where = {
      ...queryMaisonMereAAPs.where,
      OR: filters,
    };

    queryCount.where = {
      ...queryCount.where,
      OR: filters,
    };
  }

  if (legalValidationStatus) {
    queryMaisonMereAAPs.where = {
      ...queryMaisonMereAAPs.where,
      AND: [
        {
          statutValidationInformationsJuridiquesMaisonMereAAP:
            legalValidationStatus,
        },
      ],
    };

    queryCount.where = {
      ...queryCount.where,
      AND: [
        {
          statutValidationInformationsJuridiquesMaisonMereAAP:
            legalValidationStatus,
        },
      ],
    };
  }

  const maisonMereAAPs =
    await prismaClient.maisonMereAAP.findMany(
      queryMaisonMereAAPs
    );
  const count = await prismaClient.maisonMereAAP.count(queryCount);
  return {
    rows: maisonMereAAPs,
    info: processPaginationInfo({
      totalRows: count,
      limit: limit,
      offset,
    }),
  };
};
