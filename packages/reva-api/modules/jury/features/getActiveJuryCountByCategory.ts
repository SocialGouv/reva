import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";
import { candidacySearchWord } from "../../candidacy/utils/candidacy.helper";
import { getCertificationAuthorityLocalAccountByAccountId } from "../../certification-authority/features/getCertificationAuthorityLocalAccountByAccountId";
import { getWhereClauseFromSearchFilter } from "../../shared/search/search";
import { JuryStatusFilter } from "../types/juryStatusFilter.type";
import { getWhereClauseFromJuryStatusFilter } from "../utils/getWhereClauseFromJuryStatusFilter.helper";
import { getJuryListQueryWhereClauseForUserWithManageRole } from "./getJuryListQueryWhereClauseForUserWithManageRole";

export const getActiveJuryCountByCategory = async ({
  keycloakId,
  hasRole,
  searchFilter,
}: {
  keycloakId: string;
  hasRole: (role: string) => boolean;
  searchFilter?: string;
}) => {
  const JuryCountByCategory: Record<JuryStatusFilter, number> = {
    // ALL: 0,
    SCHEDULED: 0,
    PASSED: 0,
  };

  const account = await getAccountByKeycloakId({ keycloakId });
  const isCertificationAuthorityLocalAccount =
    !hasRole("admin") &&
    !hasRole("manage_certification_authority_local_account");

  const certificationAuthorityLocalAccount =
    isCertificationAuthorityLocalAccount && account
      ? await getCertificationAuthorityLocalAccountByAccountId({
          accountId: account.id,
        })
      : null;

  await Promise.all(
    (Object.keys(JuryCountByCategory) as JuryStatusFilter[]).map(
      async (statusFilter) => {
        try {
          const value: number = await new Promise((resolve, reject) => {
            {
              let whereClause: Prisma.JuryWhereInput = {};

              if (!hasRole("admin") && hasRole("manage_feasibility")) {
                whereClause = {
                  ...whereClause,
                  ...getJuryListQueryWhereClauseForUserWithManageRole({
                    account,
                    isCertificationAuthorityLocalAccount,
                    certificationAuthorityLocalAccount,
                  }),
                };
              }

              let candidacyClause: Prisma.CandidacyWhereInput =
                whereClause?.candidacy || {};
              candidacyClause = {
                ...candidacyClause,
                ...getWhereClauseFromJuryStatusFilter(statusFilter).candidacy,
                ...getWhereClauseFromSearchFilter(
                  candidacySearchWord,
                  searchFilter,
                ),
              };
              whereClause = {
                ...whereClause,
                ...getWhereClauseFromJuryStatusFilter(statusFilter),
                candidacy: candidacyClause,
              };

              prismaClient.jury
                .count({
                  where: whereClause,
                })
                .then((value) => {
                  resolve(value);
                })
                .catch(() => {
                  reject();
                });
            }
          });

          JuryCountByCategory[statusFilter] = value;
        } catch (e) {
          e;
        }
      },
    ),
  );

  return JuryCountByCategory;
};
