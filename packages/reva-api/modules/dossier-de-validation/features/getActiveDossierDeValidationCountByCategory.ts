import { Account, Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";
import { candidacySearchWord } from "../../candidacy/utils/candidacy.helper";
import { getCertificationAuthorityLocalAccountByAccountId } from "../../certification-authority/features/getCertificationAuthorityLocalAccountByAccountId";
import { getWhereClauseFromSearchFilter } from "../../shared/search/search";
import { DossierDeValidationStatusFilter } from "../types/dossierDeValidationStatusFilter.type";
import { getWhereClauseFromDossierDeValidationStatusFilter } from "../utils/getWhereClauseFromDossierDeValidationStatusFilter.helper";
import { getDossierDeValidationListQueryWhereClauseForUserWithManageRole } from "./getDossierDeValidationListQueryWhereClauseForUserWithManageRole";

export const getActiveDossierDeValidationCountByCategory = async ({
  keycloakId,
  hasRole,
  searchFilter,
  certificationAuthorityId,
  certificationAuthorityLocalAccountId,
}: {
  keycloakId: string;
  hasRole: (role: string) => boolean;
  searchFilter?: string;
  certificationAuthorityId?: string;
  certificationAuthorityLocalAccountId?: string;
}) => {
  const DossierDeValidationCountByCategory: Record<
    DossierDeValidationStatusFilter,
    number
  > = {
    ALL: 0,
    PENDING: 0,
    INCOMPLETE: 0,
  };

  const account = await getAccountByKeycloakId({ keycloakId });
  const isCertificationAuthorityLocalAccount =
    !hasRole("admin") &&
    !hasRole("manage_certification_authority_local_account");

  let certificationAuthorityLocalAccount =
    isCertificationAuthorityLocalAccount && account
      ? await getCertificationAuthorityLocalAccountByAccountId({
          accountId: account.id,
        })
      : null;

  let certificationAuthorityAccount: Account | null;

  if (hasRole("admin")) {
    if (certificationAuthorityId) {
      certificationAuthorityAccount = await prismaClient.account.findFirst({
        where: { certificationAuthorityId },
      });
    } else if (certificationAuthorityLocalAccountId) {
      certificationAuthorityLocalAccount =
        await prismaClient.certificationAuthorityLocalAccount.findUnique({
          where: { id: certificationAuthorityLocalAccountId },
          include: {
            certificationAuthorityLocalAccountOnDepartment: true,
            certificationAuthorityLocalAccountOnCertification: true,
          },
        });
    }
  }

  await Promise.all(
    (
      Object.keys(
        DossierDeValidationCountByCategory,
      ) as DossierDeValidationStatusFilter[]
    ).map(async (statusFilter) => {
      try {
        const value: number = await new Promise((resolve, reject) => {
          {
            let whereClause: Prisma.DossierDeValidationWhereInput = {};

            if (!hasRole("admin") && hasRole("manage_feasibility")) {
              whereClause = {
                ...whereClause,
                ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole(
                  {
                    account,
                    isCertificationAuthorityLocalAccount,
                    certificationAuthorityLocalAccount,
                  },
                ),
              };
            } else if (
              hasRole("admin") &&
              (certificationAuthorityAccount ||
                certificationAuthorityLocalAccount)
            ) {
              if (certificationAuthorityAccount) {
                whereClause = {
                  ...whereClause,
                  ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole(
                    {
                      account: certificationAuthorityAccount,
                      isCertificationAuthorityLocalAccount: false,
                      certificationAuthorityLocalAccount: null,
                    },
                  ),
                };
              } else if (certificationAuthorityLocalAccount) {
                whereClause = {
                  ...whereClause,
                  ...getDossierDeValidationListQueryWhereClauseForUserWithManageRole(
                    {
                      account: certificationAuthorityAccount,
                      isCertificationAuthorityLocalAccount: true,
                      certificationAuthorityLocalAccount,
                    },
                  ),
                };
              }
            }

            let candidacyClause: Prisma.CandidacyWhereInput =
              whereClause?.candidacy || {};
            candidacyClause = {
              ...candidacyClause,
              ...getWhereClauseFromDossierDeValidationStatusFilter(statusFilter)
                .candidacy,
              ...getWhereClauseFromSearchFilter(
                candidacySearchWord,
                searchFilter,
              ),
            };
            whereClause = {
              ...whereClause,
              ...getWhereClauseFromDossierDeValidationStatusFilter(
                statusFilter,
              ),
              candidacy: candidacyClause,
            };

            prismaClient.dossierDeValidation
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

        DossierDeValidationCountByCategory[statusFilter] = value;
      } catch (e) {
        console.error(e);
      }
    }),
  );

  return DossierDeValidationCountByCategory;
};
