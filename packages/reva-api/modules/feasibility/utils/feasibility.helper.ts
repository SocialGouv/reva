import { FeasibilityStatus, Prisma } from "@prisma/client";

export type FeasibilityStatusFilter =
  | FeasibilityStatus
  | "ALL"
  | "ARCHIVED"
  | "DROPPED_OUT";

export const getWhereClauseFromStatusFilter = (
  statusFilter?: FeasibilityStatusFilter
) => {
  let whereClause: Prisma.FeasibilityWhereInput = { isActive: true };
  const excludeArchivedAndDroppedOutCandidacy: Prisma.FeasibilityWhereInput = {
    candidacy: {
      candidacyStatuses: { none: { isActive: true, status: "ARCHIVE" } },
      candidacyDropOut: { is: null },
    },
  };
  switch (statusFilter) {
    case "ALL":
      whereClause = {
        ...whereClause,
        ...excludeArchivedAndDroppedOutCandidacy,
      };
      break;
    case "PENDING":
    case "REJECTED":
    case "ADMISSIBLE":
    case "INCOMPLETE":
      whereClause = {
        ...whereClause,
        decision: statusFilter,
        ...excludeArchivedAndDroppedOutCandidacy,
      };
      break;

    case "ARCHIVED":
      whereClause = {
        ...whereClause,
        candidacy: {
          candidacyStatuses: { some: { isActive: true, status: "ARCHIVE" } },
        },
      };
      break;
    case "DROPPED_OUT":
      whereClause = {
        ...whereClause,
        candidacy: {
          candidacyDropOut: { isNot: null },
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

export const getWhereClauseFromSearchFilter = (searchFilter?: string) => {
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
              certification: containsFilter("label"),
            },
          },
        },
      ],
    };
  }
  return whereClause;
};
