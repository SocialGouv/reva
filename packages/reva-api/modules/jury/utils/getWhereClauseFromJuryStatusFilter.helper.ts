import { Prisma } from "@prisma/client";
import { startOfDay } from "date-fns";

import { JuryStatusFilter } from "../types/juryStatusFilter.type";

export const getWhereClauseFromJuryStatusFilter = (
  statusFilter?: JuryStatusFilter,
) => {
  let whereClause: Prisma.JuryWhereInput = { isActive: true };
  const excludeArchivedAndDroppedOutCandidacy: Prisma.JuryWhereInput = {
    candidacy: {
      candidacyStatuses: { none: { isActive: true, status: "ARCHIVE" } },
      candidacyDropOut: { is: null },
    },
  };
  switch (statusFilter) {
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
