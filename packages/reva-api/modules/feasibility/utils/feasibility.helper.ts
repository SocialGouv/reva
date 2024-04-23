import { FeasibilityStatus, Prisma } from "@prisma/client";

export type FeasibilityStatusFilter =
  | FeasibilityStatus
  | "ALL"
  | "ARCHIVED"
  | "DROPPED_OUT";

export const excludeArchivedAndDroppedOutCandidacy: Prisma.FeasibilityWhereInput =
  {
    candidacy: {
      candidacyStatuses: { none: { isActive: true, status: "ARCHIVE" } },
      candidacyDropOut: { is: null },
    },
  };

export const excludeRejectedArchivedAndDroppedOutCandidacy: Prisma.FeasibilityWhereInput =
  {
    NOT: {
      isActive: true,
      decision: "REJECTED",
    },
    candidacy: {
      candidacyStatuses: {
        none: {
          isActive: true,
          status: "ARCHIVE",
        },
      },
      candidacyDropOut: { is: null },
    },
  };

export const getWhereClauseFromStatusFilter = (
  statusFilter?: FeasibilityStatusFilter,
) => {
  let whereClause: Prisma.FeasibilityWhereInput = { isActive: true };

  switch (statusFilter) {
    case "ALL":
      whereClause = {
        ...whereClause,
        ...excludeRejectedArchivedAndDroppedOutCandidacy,
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
