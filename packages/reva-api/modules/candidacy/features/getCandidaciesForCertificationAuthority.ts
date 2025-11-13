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
}: GetCandidaciesForCertificationAuthorityInput & {
  hasRole(role: string): boolean;
}) => {
  if (hasRole("manage_feasibility") && !certificationAuthorityId) {
    throw new Error(
      "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource",
    );
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
    ...getWhereClauseFromStatusFilter(statusFilter),
    ...getWhereClauseFromSearchFilter(candidacySearchWord, searchFilter),
    ...(cohorteVaeCollectiveId ? { cohorteVaeCollectiveId } : {}),
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
