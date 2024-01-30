import { DossierDeValidation, Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { candidacySearchWord } from "../../candidacy/utils/candidacy.helper";
import { getCertificationAuthorityLocalAccountByAccountId } from "../../certification-authority/features/getCertificationAuthorityLocalAccountByAccountId";
import { processPaginationInfo } from "../../shared/list/pagination";
import { getWhereClauseFromSearchFilter } from "../../shared/search/search";
import { DossierDeValidationStatusFilter } from "../types/dossierDeValidationStatusFilter.type";
import { getWhereClauseFromDossierDeValidationStatusFilter } from "../utils/getWhereClauseFromDossierDeValidationStatusFilter.helper";
import { getDossierDeValidationListQueryWhereClauseForUserWithManageRole } from "./getDossierDeValidationListQueryWhereClauseForUserWithManageRole";

export const getActiveDossiersDeValidation = async ({
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
  categoryFilter?: DossierDeValidationStatusFilter;
  searchFilter?: string;
}): Promise<PaginatedListResult<DossierDeValidation>> => {
  let queryWhereClause: Prisma.DossierDeValidationWhereInput = {
    isActive: true,
  };

  //only list feasibilties linked to the account certification authority
  if (hasRole("manage_feasibility")) {
    const account = await prismaClient.account.findFirstOrThrow({
      where: { keycloakId },
    });

    const isCertificationAuthorityLocalAccount = !hasRole(
      "manage_certification_authority_local_account"
    );

    const certificationAuthorityLocalAccount =
      isCertificationAuthorityLocalAccount
        ? await getCertificationAuthorityLocalAccountByAccountId({
            accountId: account.id,
          })
        : null;

    const candidacyWhereClause = {
      ...queryWhereClause?.candidacy,
      ...getWhereClauseFromDossierDeValidationStatusFilter(categoryFilter)
        .candidacy,
      ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole({
        account,
        isCertificationAuthorityLocalAccount,
        certificationAuthorityLocalAccount,
      }).candidacy,
    };

    queryWhereClause = {
      ...queryWhereClause,
      ...getWhereClauseFromDossierDeValidationStatusFilter(categoryFilter),
      ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole({
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

  const rows = await prismaClient.dossierDeValidation.findMany({
    where: queryWhereClause,
    skip: offset,
    take: limit,
    orderBy: [{ createdAt: "desc" }],
  });

  const totalRows = await prismaClient.dossierDeValidation.count({
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
