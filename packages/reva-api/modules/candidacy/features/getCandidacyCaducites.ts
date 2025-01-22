import { Candidacy, Prisma } from "@prisma/client";
import { subDays } from "date-fns";
import { prismaClient } from "../../../prisma/client";
import { getCertificationAuthorityLocalAccountByAccountId } from "../../certification-authority/features/getCertificationAuthorityLocalAccountByAccountId";
import { getFeasibilityListQueryWhereClauseForUserWithManageFeasibilityRole } from "../../feasibility/features/getFeasibilityListQueryWhereClauseForUserWithManageFeasibilityRole";
import {
  CADUCITE_THRESHOLD_DAYS,
  WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
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
  hasRole,
  keycloakId,
}: {
  offset?: number;
  limit?: number;
  searchFilter?: string;
  status: CandidacyCaduciteStatus;
  hasRole: (role: string) => boolean;
  keycloakId: string;
}): Promise<PaginatedListResult<Candidacy>> => {
  if (!status || !["CADUQUE", "CONTESTATION"].includes(status)) {
    throw new Error("Statut de caducité invalide");
  }

  let queryWhereClause: Prisma.CandidacyWhereInput = {};

  switch (status) {
    case "CADUQUE":
      queryWhereClause = {
        ...queryWhereClause,
        ...WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
        lastActivityDate: {
          lte: subDays(new Date(), CADUCITE_THRESHOLD_DAYS),
        },
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

  if (hasRole("manage_feasibility")) {
    const account = await prismaClient.account.findFirstOrThrow({
      where: { keycloakId },
    });

    const isCertificationAuthorityLocalAccount = !hasRole(
      "manage_certification_authority_local_account",
    );

    const certificationAuthorityLocalAccount =
      isCertificationAuthorityLocalAccount
        ? await getCertificationAuthorityLocalAccountByAccountId({
            accountId: account.id,
          })
        : null;

    queryWhereClause = {
      ...queryWhereClause,
      Feasibility: {
        every: {
          ...getFeasibilityListQueryWhereClauseForUserWithManageFeasibilityRole(
            {
              account,
              isCertificationAuthorityLocalAccount,
              certificationAuthorityLocalAccount,
            },
          ),
        },
      },
    };
  } else if (!hasRole("admin")) {
    throw new Error("Utilisateur non autorisé");
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
