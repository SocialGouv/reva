import { Prisma } from "@prisma/client";
import { startOfDay } from "date-fns";

import { JuryStatusFilter } from "../types/juryStatusFilter.type";

export const getWhereClauseFromJuryStatusFilter = (
  statusFilter?: JuryStatusFilter,
) => {
  let whereClause: Prisma.JuryWhereInput = { isActive: true };
  const excludeArchivedAndDroppedOutCandidacy: Prisma.JuryWhereInput = {
    candidacy: {
      status: {
        not: "ARCHIVE",
      },
      candidacyDropOut: { is: null },
    },
  };
  switch (statusFilter) {
    case undefined:
    case "ALL":
      whereClause = {
        ...whereClause,
        ...excludeArchivedAndDroppedOutCandidacy,
      };
      break;
    case "SCHEDULED":
      whereClause = {
        ...whereClause,
        ...excludeArchivedAndDroppedOutCandidacy,
        dateOfSession: {
          gte: startOfDay(new Date()),
        },
      };
      break;
    case "PASSED":
      whereClause = {
        ...whereClause,
        ...excludeArchivedAndDroppedOutCandidacy,
        dateOfSession: {
          lt: startOfDay(new Date()),
        },
      };
      break;
  }
  return whereClause;
};
