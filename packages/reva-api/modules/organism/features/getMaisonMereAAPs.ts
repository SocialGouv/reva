import {
  MaisonMereAAP,
  Prisma,
  type StatutValidationInformationsJuridiquesMaisonMereAAP,
} from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";

export const buildMaisonMereFilters = (searchFilter: string) => {
  const containsFilter = (field: string) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

  const filtersAccount = {
    gestionnaire: {
      OR: [
        containsFilter("firstname"),
        containsFilter("lastname"),
        containsFilter("email"),
      ],
    },
  };

  const filtersLegalInformation = {
    maisonMereAAPLegalInformationDocuments: {
      OR: [
        containsFilter("managerFirstname"),
        containsFilter("managerLastname"),
      ],
    },
  };

  return [
    containsFilter("raisonSociale"),
    filtersAccount,
    filtersLegalInformation,
  ];
};

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
  const orderBy: Prisma.MaisonMereAAPOrderByWithRelationInput[] =
    legalValidationStatus === "EN_ATTENTE_DE_VERIFICATION"
      ? [{ maisonMereAAPLegalInformationDocuments: { createdAt: "desc" } }, { raisonSociale: "asc"}]
      : [{ createdAt: "desc" }, { raisonSociale: "asc"}];

  const queryMaisonMereAAPs: Prisma.MaisonMereAAPFindManyArgs = {
    orderBy,
    take: limit,
    skip: offset,
  };

  const queryCount: Prisma.MaisonMereAAPCountArgs = {};

  if (searchFilter) {
    const filters = buildMaisonMereFilters(searchFilter);

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
    await prismaClient.maisonMereAAP.findMany(queryMaisonMereAAPs);
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
