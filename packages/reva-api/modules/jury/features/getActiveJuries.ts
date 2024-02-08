import { Jury, Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { candidacySearchWord } from "../../candidacy/utils/candidacy.helper";
import { getCertificationAuthorityLocalAccountByAccountId } from "../../certification-authority/features/getCertificationAuthorityLocalAccountByAccountId";
import { processPaginationInfo } from "../../shared/list/pagination";
import { getWhereClauseFromSearchFilter } from "../../shared/search/search";
import { JuryStatusFilter } from "../types/juryStatusFilter.type";
import { getWhereClauseFromJuryStatusFilter } from "../utils/getWhereClauseFromJuryStatusFilter.helper";
import { getJuryListQueryWhereClauseForUserWithManageRole } from "./getJuryListQueryWhereClauseForUserWithManageRole";

export const getActiveJuries = async ({
  keycloakId,
  hasRole,
  limit = 10,
  offset = 0,
  categoryFilter,
  searchFilter,
}: {
  keycloakId: string;
  hasRole: (role: string) => boolean;
  limit?: number;
  offset?: number;
  categoryFilter?: JuryStatusFilter;
  searchFilter?: string;
}): Promise<PaginatedListResult<Jury>> => {
  let queryWhereClause: Prisma.JuryWhereInput = {
    isActive: true,
    ...getWhereClauseFromJuryStatusFilter(categoryFilter),
  };

  //only list feasibilties linked to the account certification authority
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

    const candidacyWhereClause = {
      ...queryWhereClause?.candidacy,
      ...getJuryListQueryWhereClauseForUserWithManageRole({
        account,
        isCertificationAuthorityLocalAccount,
        certificationAuthorityLocalAccount,
      }).candidacy,
    };

    queryWhereClause = {
      ...queryWhereClause,
      ...getJuryListQueryWhereClauseForUserWithManageRole({
        account,
        isCertificationAuthorityLocalAccount,
        certificationAuthorityLocalAccount,
      }),
      candidacy: candidacyWhereClause,
    };
  }

  if (searchFilter && searchFilter.length > 0) {
    const candidacyClause: Prisma.CandidacyWhereInput =
      queryWhereClause?.candidacy || ({} as const);
    queryWhereClause = {
      ...queryWhereClause,
      candidacy: {
        ...candidacyClause,
        ...getWhereClauseFromSearchFilter(candidacySearchWord, searchFilter),
      },
    };
  }

  const rows = await prismaClient.jury.findMany({
    where: queryWhereClause,
    skip: offset,
    take: limit,
    orderBy: [{ createdAt: "desc" }],
  });

  const totalRows = await prismaClient.jury.count({
    where: queryWhereClause,
  });

  const page = {
    rows,
    info: processPaginationInfo({
      limit: limit,
      offset: offset,
      totalRows,
    }),
  };

  return page;
};
