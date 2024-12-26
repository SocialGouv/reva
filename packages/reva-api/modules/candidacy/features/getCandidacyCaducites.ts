import { Candidacy, Prisma } from "@prisma/client";
import { subDays } from "date-fns";
import { prismaClient } from "../../../prisma/client";
import {
  CADUCITE_THRESHOLD_DAYS,
  CADUCITE_VALID_STATUSES,
} from "../../shared/candidacy/candidacyCaducite";
import { processPaginationInfo } from "../../shared/list/pagination";
import { getWhereClauseFromSearchFilter } from "../../shared/search/search";
import { CandidacyCaduciteStatus } from "../candidacy.types";
import { candidacySearchWord } from "../utils/candidacy.helper";

export const getCandidacyCaducites = async ({
  offset = 0,
  limit = 10,
  searchFilter,
  status,
}: {
  offset?: number;
  limit?: number;
  searchFilter?: string;
  status: CandidacyCaduciteStatus;
}): Promise<PaginatedListResult<Candidacy>> => {
  if (!status || !["CADUQUE", "CONTESTATION"].includes(status)) {
    throw new Error("Statut de caducité invalide");
  }

  let queryWhereClause: Prisma.CandidacyWhereInput = {};

  switch (status) {
    case "CADUQUE":
      queryWhereClause = {
        ...queryWhereClause,
        lastActivityDate: {
          lte: subDays(new Date(), CADUCITE_THRESHOLD_DAYS),
        },
        status: {
          in: CADUCITE_VALID_STATUSES,
        },
        candidacyDropOut: { is: null },
        candidacyContestationCaducite: {
          none: {
            certificationAuthorityContestationDecision: {
              in: ["DECISION_PENDING", "CADUCITE_CONFIRMED"],
            },
          },
        },
      };
      break;
    case "CONTESTATION":
      queryWhereClause = {
        ...queryWhereClause,
        candidacyContestationCaducite: {
          some: {
            certificationAuthorityContestationDecision: "DECISION_PENDING",
          },
        },
        candidacyDropOut: { is: null },
        status: { not: "ARCHIVE" },
      };
      break;
  }

  if (searchFilter && searchFilter.length > 0) {
    queryWhereClause = {
      ...queryWhereClause,
      ...getWhereClauseFromSearchFilter(candidacySearchWord, searchFilter),
    };
  }

  const rows = await prismaClient.candidacy.findMany({
    where: queryWhereClause,
    skip: offset,
    take: limit,
    orderBy: [{ createdAt: "desc" }],
  });

  const totalRows = await prismaClient.candidacy.count({
    where: queryWhereClause,
  });

  const page = {
    rows,
    info: processPaginationInfo({
      limit,
      offset,
      totalRows,
    }),
  };

  return page;
};
