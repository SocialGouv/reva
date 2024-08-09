import { Candidacy, Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
import { getWhereClauseFromSearchFilter } from "../../shared/search/search";
import { CandidacyStatusFilter } from "../candidacy.types";
import {
  candidacySearchWord,
  getWhereClauseFromStatusFilter,
} from "../utils/candidacy.helper";

export const getCandidacies = async ({
  hasRole,
  iAMId,
  limit,
  offset,
  statusFilter,
  searchFilter,
}: {
  hasRole(role: string): boolean;
  iAMId: string;
  limit?: number;
  offset?: number;
  statusFilter?: CandidacyStatusFilter;
  searchFilter?: string;
}) => {
  const realOffset = offset || 0;
  const realLimit = limit || 10000;
  let candidaciesAndTotal: {
    total: number;
    candidacies: Candidacy[];
  } = {
    total: 0,
    candidacies: [],
  };

  if (hasRole("admin")) {
    candidaciesAndTotal = await getCandidaciesFromDb({
      offset: realOffset,
      limit: realLimit,
      statusFilter,
      searchFilter,
    });
  } else if (hasRole("manage_candidacy")) {
    candidaciesAndTotal = await getCandidaciesFromDb({
      organismAccountKeycloakId: iAMId,
      offset: realOffset,
      limit: realLimit,
      statusFilter,
      searchFilter,
    });
  }

  return {
    rows: candidaciesAndTotal.candidacies,
    info: processPaginationInfo({
      totalRows: candidaciesAndTotal.total,
      limit: realLimit,
      offset: realOffset,
    }),
  };
};

const getCandidaciesFromDb = async ({
  limit,
  offset,
  organismAccountKeycloakId,
  statusFilter,
  searchFilter,
}: {
  limit: number;
  offset: number;
  organismAccountKeycloakId?: string;
  statusFilter?: CandidacyStatusFilter;
  searchFilter?: string;
}) => {
  let whereClause: Prisma.CandidacyWhereInput = organismAccountKeycloakId
    ? {
        organism: {
          OR: [
            {
              accounts: {
                some: {
                  keycloakId: organismAccountKeycloakId,
                },
              },
            },
            {
              maisonMereAAP: {
                gestionnaire: {
                  keycloakId: organismAccountKeycloakId,
                },
              },
            },
          ],
        },
      }
    : {};

  whereClause = {
    ...whereClause,
    ...getWhereClauseFromStatusFilter(statusFilter),
    ...getWhereClauseFromSearchFilter(candidacySearchWord, searchFilter),
  };

  const candidaciesCount = await prismaClient.candidacy.count({
    where: whereClause,
  });

  const candidacies = await prismaClient.candidacy.findMany({
    orderBy: [{ createdAt: "desc" }],
    where: whereClause,
    skip: offset,
    take: limit,
  });

  return {
    total: candidaciesCount,
    candidacies,
  };
};
