import {
  CandidaciesStatus,
  Candidacy,
  CandidacyDropOut,
  CandidacyStatusStep,
  Certification,
  Department,
  Organism,
  Prisma,
} from "@prisma/client";

import * as domain from "../../../../domain/types/candidacy";
import { CandidacyStatusFilter } from "../../../../domain/types/candidacy";
import { processPaginationInfo } from "../../../../domain/utils/pagination";
import { prismaClient } from "../../../database/postgres/client";

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
    phone: candidacy.phone,
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

type CertificationSummary = Pick<Certification, "id" | "label" | "acronym">;

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
          accounts: {
            some: {
              keycloakId: organismAccountKeycloakId,
            },
          },
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
              acronym: true,
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
        phone: c.candidate?.phone || c.phone,
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

const getStatusFromStatusFilter = (statusFilter: string) => {
  let status: CandidacyStatusStep | null = null;
  switch (statusFilter) {
    case "PARCOURS_CONFIRME_HORS_ABANDON":
      status = "PARCOURS_CONFIRME";
      break;
    case "PRISE_EN_CHARGE_HORS_ABANDON":
      status = "PRISE_EN_CHARGE";
      break;
    case "PARCOURS_ENVOYE_HORS_ABANDON":
      status = "PARCOURS_ENVOYE";
      break;
    case "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON":
      status = "DEMANDE_FINANCEMENT_ENVOYE";
      break;
    case "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON":
      status = "DEMANDE_PAIEMENT_ENVOYEE";
      break;
    case "VALIDATION_HORS_ABANDON":
      status = "VALIDATION";
      break;
    case "PROJET_HORS_ABANDON":
      status = "PROJET";
      break;
  }
  return status;
};

const getWhereClauseFromStatusFilter = (
  statusFilter?: CandidacyStatusFilter
) => {
  let whereClause = {};
  switch (statusFilter) {
    case "PARCOURS_CONFIRME_HORS_ABANDON":
    case "PRISE_EN_CHARGE_HORS_ABANDON":
    case "PARCOURS_ENVOYE_HORS_ABANDON":
    case "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON":
    case "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON":
    case "VALIDATION_HORS_ABANDON":
    case "PROJET_HORS_ABANDON": {
      const status = getStatusFromStatusFilter(statusFilter);
      if (status !== null) {
        whereClause = {
          ...whereClause,
          candidacyDropOut: null,
          candidacyStatuses: {
            some: { AND: { isActive: true, status } },
          },
        };
      }
      break;
    }
    case "ACTIVE_HORS_ABANDON":
      whereClause = {
        ...whereClause,
        candidacyDropOut: null,
        candidacyStatuses: {
          some: {
            AND: {
              isActive: true,
              status: { notIn: ["ARCHIVE", "PROJET"] },
            },
          },
        },
      };
      break;
    case "ABANDON":
      whereClause = {
        ...whereClause,
        NOT: { candidacyDropOut: null },
      };
      break;
    case "ARCHIVE_HORS_ABANDON_HORS_REORIENTATION":
      whereClause = {
        ...whereClause,
        candidacyDropOut: null,
        reorientationReasonId: null,
        candidacyStatuses: {
          some: { AND: { isActive: true, status: "ARCHIVE" } },
        },
      };
      break;
    case "REORIENTEE":
      whereClause = {
        ...whereClause,
        NOT: { reorientationReasonId: null },
        candidacyStatuses: {
          some: { AND: { isActive: true, status: "ARCHIVE" } },
        },
      };
      break;
  }
  return whereClause;
};

const buildContainsFilterClause =
  (searchFilter: string) => (field: string) => ({
    [field]: { contains: searchFilter, mode: "insensitive" },
  });

const getWhereClauseFromSearchFilter = (searchFilter?: string) => {
  let whereClause: Prisma.CandidacyWhereInput = {};
  if (searchFilter) {
    const containsFilter = buildContainsFilterClause(searchFilter);
    whereClause = {
      OR: [
        {
          candidate: {
            OR: [
              containsFilter("lastname"),
              containsFilter("firstname"),
              containsFilter("firstname2"),
              containsFilter("firstname3"),
              containsFilter("email"),
              containsFilter("phone"),
            ],
          },
        },
        { organism: containsFilter("label") },
        { department: containsFilter("label") },
        {
          certificationsAndRegions: {
            some: {
              AND: [
                { isActive: true },
                {
                  certification: {
                    OR: [containsFilter("label"), containsFilter("acronym")],
                  },
                },
              ],
            },
          },
        },
      ],
    };
  }
  return whereClause;
};
