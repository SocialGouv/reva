import {
  CandidaciesStatus,
  Candidacy,
  CandidacyDropOut,
  Certification,
  Department,
  Organism,
  Prisma,
} from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
import * as domain from "../candidacy.types";
import { CandidacyStatusFilter } from "../candidacy.types";
import {
  getWhereClauseFromSearchFilter,
  getWhereClauseFromStatusFilter,
} from "../utils/candidacy.helper";

const toDomainCandidacySummary = (
  candidacy: Candidacy & {
    candidacyStatuses: CandidaciesStatus[];
    certification: CertificationSummary;
    organism: Organism | null;
    firstname: string | undefined;
    lastname: string | undefined;
    department: Department | null;
    candidacyDropOut: CandidacyDropOut | null;
  }
) => {
  const statuses = candidacy.candidacyStatuses;
  const lastStatus = statuses.filter((status) => status.isActive)[0];
  const sentStatus = statuses.filter(
    (status) => status.status == "VALIDATION"
  )?.[0];
  const sentAt = sentStatus?.createdAt;

  return {
    id: candidacy.id,
    deviceId: candidacy.deviceId,
    organismId: candidacy.organismId,
    organism: candidacy.organism,
    certificationId: candidacy.certification?.id,
    certification: candidacy.certification,
    isCertificationPartial: candidacy.isCertificationPartial,
    firstname: candidacy.firstname,
    lastname: candidacy.lastname,
    email: candidacy.email,
    isDroppedOut: candidacy.candidacyDropOut !== null,
    isReorientation: candidacy.reorientationReasonId !== null,
    lastStatus,
    dropOutReason: null,
    reorientationReason: null,
    department: candidacy.department,
    createdAt: candidacy.createdAt,
    sentAt,
  };
};

type CertificationSummary = Pick<Certification, "id" | "label">;

const toDomainCandidacySummaries = (
  candidacies: (Candidacy & {
    candidacyStatuses: CandidaciesStatus[];
    certification: CertificationSummary;
    organism: Organism | null;
    firstname: string | undefined;
    lastname: string | undefined;
    department: Department | null;
    candidacyDropOut: CandidacyDropOut | null;
  })[]
): domain.CandidacySummary[] => {
  return candidacies.map(toDomainCandidacySummary);
};

export const getCandidaciesFromDb = async ({
  limit,
  offset,
  organismAccountKeycloakId,
  statusFilter,
  searchFilter,
}: {
  limit: number;
  offset: number;
  organismAccountKeycloakId?: string;
  statusFilter?: CandidacyStatusFilter;
  searchFilter?: string;
}) => {
  let whereClause: Prisma.CandidacyWhereInput = organismAccountKeycloakId
    ? {
        organism: {
          OR: [
            {
              accounts: {
                some: {
                  keycloakId: organismAccountKeycloakId,
                },
              },
            },
            {
              maisonMereAAP: {
                gestionnaire: {
                  keycloakId: organismAccountKeycloakId,
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

  const candidaciesCount = await prismaClient.candidacy.count({
    where: whereClause,
  });

  const candidacies = await prismaClient.candidacy.findMany({
    orderBy: [{ createdAt: "desc" }],
    where: whereClause,
    include: {
      candidacyStatuses: true,
      certificationsAndRegions: {
        select: {
          certification: {
            select: {
              id: true,
              label: true,
              typeDiplome: true,
            },
          },
        },
        where: {
          isActive: true,
        },
      },
      candidate: true,
      organism: true,
      department: true,
      candidacyDropOut: true,
    },
    skip: offset,
    take: limit,
  });

  return {
    total: candidaciesCount,
    candidacies: toDomainCandidacySummaries(
      candidacies.map((c) => ({
        ...c,
        department: c.department,
        certification: c.certificationsAndRegions[0]?.certification,
        firstname: c.candidate?.firstname,
        lastname: c.candidate?.lastname,
        phone: c.candidate?.phone || null,
        email: c.candidate?.email || c.email,
      }))
    ),
  };
};

export const getCandidacySummaries = async ({
  hasRole,
  iAMId,
  limit,
  offset,
  statusFilter,
  searchFilter,
}: {
  hasRole(role: string): boolean;
  iAMId: string;
  limit?: number;
  offset?: number;
  statusFilter?: CandidacyStatusFilter;
  searchFilter?: string;
}): Promise<PaginatedListResult<domain.CandidacySummary>> => {
  const realOffset = offset || 0;
  const realLimit = limit || 10000;
  let candidaciesAndTotal: {
    total: number;
    candidacies: domain.CandidacySummary[];
  } = {
    total: 0,
    candidacies: [],
  };

  if (hasRole("admin")) {
    candidaciesAndTotal = await getCandidaciesFromDb({
      offset: realOffset,
      limit: realLimit,
      statusFilter,
      searchFilter,
    });
  } else if (hasRole("manage_candidacy")) {
    candidaciesAndTotal = await getCandidaciesFromDb({
      organismAccountKeycloakId: iAMId,
      offset: realOffset,
      limit: realLimit,
      statusFilter,
      searchFilter,
    });
  }

  return {
    rows: candidaciesAndTotal.candidacies,
    info: processPaginationInfo({
      totalRows: candidaciesAndTotal.total,
      limit: realLimit,
      offset: realOffset,
    }),
  };
};
