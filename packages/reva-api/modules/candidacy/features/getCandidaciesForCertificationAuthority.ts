import { CandidacyStatusStep, Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { getWhereClauseFromSearchFilter } from "@/modules/shared/search/search";
import { prismaClient } from "@/prisma/client";

import { GetCandidaciesForCertificationAuthorityInput } from "../candidacy.types";
import {
  candidacySearchWord,
  getWhereClauseFromStatusFilter,
} from "../utils/candidacy.helper";

const CANDIDACY_STATUS_TO_INCLUDE: CandidacyStatusStep[] = [
  CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
  CandidacyStatusStep.DOSSIER_FAISABILITE_COMPLET,
  CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
  CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
  CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE,
  CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
  CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE,
];

export const getCandidaciesForCertificationAuthority = async ({
  certificationAuthorityId,
  hasRole,
  offset = 0,
  limit = 10000,
  statusFilter,
  searchFilter,
  sortByFilter,
  cohorteVaeCollectiveId,
  feasibilityStatuses,
  validationStatuses,
  juryStatuses,
  juryResults,
  includeDropouts = false,
}: GetCandidaciesForCertificationAuthorityInput & {
  hasRole(role: string): boolean;
}) => {
  if (hasRole("manage_feasibility") && !certificationAuthorityId) {
    throw new Error(
      "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource",
    );
  }

  const additionalClauses: Prisma.CandidacyWhereInput[] = [];

  // Filtre par statuts de faisabilité
  if (feasibilityStatuses && feasibilityStatuses.length > 0) {
    additionalClauses.push({
      status: {
        in: feasibilityStatuses,
      },
    });
  }

  // Filtre par statuts de validation
  if (validationStatuses && validationStatuses.length > 0) {
    additionalClauses.push({
      status: {
        in: validationStatuses,
      },
    });
  }

  // Filtre par statuts de passage devant le jury
  if (juryStatuses && juryStatuses.length > 0) {
    const juryClause: Prisma.CandidacyWhereInput[] = [];
    juryStatuses.forEach((juryStatus) => {
      if (juryStatus === "TO_SCHEDULE") {
        // À programmer: DossierDeValidation actif avec décision PENDING ou COMPLETE
        // ET (pas de jury OU seulement des jurys inactifs)
        juryClause.push({
          dossierDeValidation: {
            some: {
              isActive: true,
              decision: { in: ["PENDING", "COMPLETE"] },
            },
          },
          OR: [{ Jury: { none: {} } }, { Jury: { none: { isActive: true } } }],
        });
      } else if (juryStatus === "SCHEDULED") {
        // Programmé: jury actif sans résultat
        juryClause.push({
          Jury: {
            some: {
              isActive: true,
              dateOfResult: null,
            },
          },
        });
      } else if (juryStatus === "AWAITING_RESULT") {
        // En attente de résultat: date de session passée et pas encore de résultat
        juryClause.push({
          Jury: {
            some: {
              isActive: true,
              dateOfSession: { gt: new Date() },
              result: null,
            },
          },
        });
      }
    });
    if (juryClause.length > 0) {
      additionalClauses.push({ OR: juryClause });
    }
  }

  // Filtre par résultats de jury
  if (juryResults && juryResults.length > 0) {
    additionalClauses.push({
      Jury: {
        some: {
          isActive: true,
          result: {
            in: juryResults,
          },
        },
      },
    });
  }
  const whereClause: Prisma.CandidacyWhereInput = {
    status: {
      in: CANDIDACY_STATUS_TO_INCLUDE,
    },
    Feasibility: {
      some: {
        certificationAuthorityId: certificationAuthorityId,
      },
    },
    ...getWhereClauseFromStatusFilter(statusFilter, includeDropouts),
    ...getWhereClauseFromSearchFilter(candidacySearchWord, searchFilter),
    ...(cohorteVaeCollectiveId ? { cohorteVaeCollectiveId } : {}),
    ...(additionalClauses.length > 0 ? { OR: additionalClauses } : {}),
    ...(!includeDropouts && !statusFilter ? { candidacyDropOut: null } : {}),
  };

  const totalRows = await prismaClient.candidacy.count({
    where: whereClause,
  });

  const candidacies = await prismaClient.candidacy.findMany({
    where: whereClause,
    orderBy: getOrderByClauseFromSortByFilter(sortByFilter),
    skip: offset,
    take: limit,
  });

  return {
    rows: candidacies,
    info: processPaginationInfo({
      totalRows,
      limit,
      offset,
    }),
  };
};

const getOrderByClauseFromSortByFilter = (
  sortByFilter: GetCandidaciesForCertificationAuthorityInput["sortByFilter"] = "DATE_CREATION_DESC",
):
  | Prisma.CandidacyOrderByWithRelationInput
  | Prisma.CandidacyOrderByWithRelationInput[]
  | undefined => {
  if (sortByFilter === "DATE_CREATION_DESC") {
    return [{ createdAt: "desc" }];
  }
  if (sortByFilter === "DATE_CREATION_ASC") {
    return [{ createdAt: "asc" }];
  }
  if (sortByFilter === "DATE_ENVOI_DESC") {
    return [{ sentAt: "desc" }];
  }
  if (sortByFilter === "DATE_ENVOI_ASC") {
    return [{ sentAt: "asc" }];
  }

  return undefined;
};
