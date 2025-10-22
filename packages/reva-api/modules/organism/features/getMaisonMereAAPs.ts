import {
  MaisonMereAAP,
  Prisma,
  type StatutValidationInformationsJuridiquesMaisonMereAAP,
} from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const buildMaisonMereFilters: (
  searchFilter: string,
) => Prisma.MaisonMereAAPWhereInput = (searchFilter) => {
  const containsFilter = (field: string) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

  const accountContainsFilter = [
    containsFilter("firstname"),
    containsFilter("lastname"),
    containsFilter("email"),
  ];

  const filtersAccount: Prisma.MaisonMereAAPWhereInput = {
    gestionnaire: {
      OR: accountContainsFilter,
    },
  };

  const filtersLegalInformation: Prisma.MaisonMereAAPWhereInput = {
    maisonMereAAPLegalInformationDocuments: {
      OR: [
        containsFilter("managerFirstname"),
        containsFilter("managerLastname"),
      ],
    },
  };

  const filterOrganisms: Prisma.MaisonMereAAPWhereInput = {
    organismes: {
      some: {
        OR: [containsFilter("contactAdministrativeEmail")],
      },
    },
  };

  const filterOrganismAccounts: Prisma.MaisonMereAAPWhereInput = {
    organismes: {
      some: {
        organismOnAccounts: {
          some: {
            account: {
              OR: accountContainsFilter,
            },
          },
        },
      },
    },
  };

  return {
    OR: [
      containsFilter("raisonSociale"),
      containsFilter("siret"),
      filtersAccount,
      filtersLegalInformation,
      filterOrganisms,
      filterOrganismAccounts,
    ],
  };
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
      ? [
          { maisonMereAAPLegalInformationDocuments: { createdAt: "desc" } },
          { raisonSociale: "asc" },
        ]
      : [{ createdAt: "desc" }, { raisonSociale: "asc" }];

  const queryMaisonMereAAPs: Prisma.MaisonMereAAPFindManyArgs = {
    orderBy,
    take: limit,
    skip: offset,
  };

  const queryCount: Prisma.MaisonMereAAPCountArgs = {};

  const legalValidationStatusFilters = legalValidationStatus
    ? [
        {
          statutValidationInformationsJuridiquesMaisonMereAAP:
            legalValidationStatus,
        },
      ]
    : [];

  const searchWordFilters = searchFilter
    ? searchFilter.split(/\s+/).map(buildMaisonMereFilters)
    : [];

  const filters = {
    AND: [...legalValidationStatusFilters, ...searchWordFilters],
  };

  queryMaisonMereAAPs.where = {
    ...queryMaisonMereAAPs.where,
    ...filters,
  };

  queryCount.where = {
    ...queryCount.where,
    ...filters,
  };

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
