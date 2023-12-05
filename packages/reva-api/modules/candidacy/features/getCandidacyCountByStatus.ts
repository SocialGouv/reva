import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { CandidacyStatusFilter } from "../candidacy.types";
import {
  getWhereClauseFromSearchFilter,
  getWhereClauseFromStatusFilter,
} from "../utils/candidacy.helper";

export const getCandidacyCountByStatus = async ({
  hasRole,
  IAMId,
  searchFilter,
}: {
  hasRole(role: string): boolean;
  IAMId: string;
  searchFilter?: string;
}) => {
  const candidacyCountByStatus: Record<CandidacyStatusFilter, number> = {
    ACTIVE_HORS_ABANDON: 0,
    ABANDON: 0,
    REORIENTEE: 0,
    ARCHIVE_HORS_ABANDON_HORS_REORIENTATION: 0,
    PARCOURS_CONFIRME_HORS_ABANDON: 0,
    PRISE_EN_CHARGE_HORS_ABANDON: 0,
    PARCOURS_ENVOYE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON: 0,
    DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON: 0,
    DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON: 0,
    VALIDATION_HORS_ABANDON: 0,
    PROJET_HORS_ABANDON: 0,
  };

  if (!hasRole("admin") && !hasRole("manage_candidacy")) {
    return [];
  }

  await Promise.all(
    (Object.keys(candidacyCountByStatus) as CandidacyStatusFilter[]).map(
      async (statusFilter) => {
        try {
          const value: number = await new Promise((resolve, reject) => {
            {
              let whereClause: Prisma.CandidacyWhereInput =
                !hasRole("admin") && hasRole("manage_candidacy")
                  ? {
                      organism: {
                        OR: [
                          {
                            accounts: {
                              some: {
                                keycloakId: IAMId,
                              },
                            },
                          },
                          {
                            maisonMereAAP: {
                              gestionnaire: {
                                keycloakId: IAMId,
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
                ...getWhereClauseFromSearchFilter(searchFilter),
              };

              prismaClient.candidacy
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

          candidacyCountByStatus[statusFilter] = value;
        } catch (error) {
          console.error(error);
        }
      }
    )
  );

  return candidacyCountByStatus;
};
