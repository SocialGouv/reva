import { FeasibilityStatus, Prisma } from "@prisma/client";

export type FeasibilityStatusFilter = FeasibilityStatus | "ALL";

export const getWhereClauseFromStatusFilter = (
  statusFilter?: FeasibilityStatusFilter
) => {
  let whereClause: Prisma.FeasibilityWhereInput = {};
  switch (statusFilter) {
    case "ALL":
      whereClause = {
        ...whereClause,
        OR: [{ isActive: true }, { isActive: false, decision: "INCOMPLETE" }],
      };
      break;
    case "PENDING":
    case "REJECTED":
    case "ADMISSIBLE":
      whereClause = { ...whereClause, isActive: true, decision: statusFilter };
      break;
    case "INCOMPLETE":
      whereClause = { ...whereClause, isActive: false, decision: "INCOMPLETE" };
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
