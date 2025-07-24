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
  certificationAuthorityId,
  certificationAuthorityLocalAccountId,
}: {
  keycloakId: string;
  hasRole: (role: string) => boolean;
  limit?: number;
  offset?: number;
  categoryFilter?: DossierDeValidationStatusFilter;
  searchFilter?: string;
  certificationAuthorityId?: string;
  certificationAuthorityLocalAccountId?: string;
}): Promise<PaginatedListResult<DossierDeValidation>> => {
  let queryWhereClause: Prisma.DossierDeValidationWhereInput = {
    isActive: true,
    ...getWhereClauseFromDossierDeValidationStatusFilter(categoryFilter),
  };

  //only list feasibilties linked to the account certification authority
  if (hasRole("manage_feasibility")) {
    const account = await prismaClient.account.findFirstOrThrow({
      where: { keycloakId },
    });
    if (
      hasRole("manage_certification_authority_local_account") &&
      certificationAuthorityLocalAccountId
    ) {
      if (!account.certificationAuthorityId) {
        throw new Error("Utilisateur non autorisé");
      }

      const certificationAuthorityLocalAccount =
        await prismaClient.certificationAuthorityLocalAccount.findUnique({
          where: {
            id: certificationAuthorityLocalAccountId,
            certificationAuthorityId: account.certificationAuthorityId,
          },
        });

      const candidacyWhereClause = {
        ...queryWhereClause?.candidacy,
        ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole({
          account: null,
          isCertificationAuthorityLocalAccount: true,
          certificationAuthorityLocalAccount,
        }).candidacy,
      };

      queryWhereClause = {
        ...queryWhereClause,
        ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole({
          account: null,
          isCertificationAuthorityLocalAccount: true,
          certificationAuthorityLocalAccount,
        }),
        candidacy: candidacyWhereClause,
      };
    } else {
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
        ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole({
          account,
          isCertificationAuthorityLocalAccount,
          certificationAuthorityLocalAccount,
        }).candidacy,
      };

      queryWhereClause = {
        ...queryWhereClause,
        ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole({
          account,
          isCertificationAuthorityLocalAccount,
          certificationAuthorityLocalAccount,
        }),
        candidacy: candidacyWhereClause,
      };
    }
  } else if (
    hasRole("admin") &&
    (certificationAuthorityId || certificationAuthorityLocalAccountId)
  ) {
    if (certificationAuthorityId) {
      const account = await prismaClient.account.findFirst({
        where: { certificationAuthorityId },
      });

      if (account) {
        const candidacyWhereClause = {
          ...queryWhereClause?.candidacy,
          ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole({
            account,
            isCertificationAuthorityLocalAccount: false,
            certificationAuthorityLocalAccount: null,
          }).candidacy,
        };

        queryWhereClause = {
          ...queryWhereClause,
          ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole({
            account,
            isCertificationAuthorityLocalAccount: false,
            certificationAuthorityLocalAccount: null,
          }),
          candidacy: candidacyWhereClause,
        };
      }
    } else if (certificationAuthorityLocalAccountId) {
      const certificationAuthorityLocalAccount =
        await prismaClient.certificationAuthorityLocalAccount.findUnique({
          where: { id: certificationAuthorityLocalAccountId },
          include: {
            certificationAuthorityLocalAccountOnDepartment: true,
            certificationAuthorityLocalAccountOnCertification: true,
          },
        });

      const candidacyWhereClause = {
        ...queryWhereClause?.candidacy,
        ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole({
          account: null,
          isCertificationAuthorityLocalAccount: true,
          certificationAuthorityLocalAccount,
        }).candidacy,
      };

      queryWhereClause = {
        ...queryWhereClause,
        ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole({
          account: null,
          isCertificationAuthorityLocalAccount: true,
          certificationAuthorityLocalAccount,
        }),
        candidacy: candidacyWhereClause,
      };
    }
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
