import { Prisma } from "@prisma/client";

import { DossierDeValidationStatusFilter } from "../types/dossierDeValidationStatusFilter.type";

export const getWhereClauseFromDossierDeValidationStatusFilter = (
  statusFilter?: DossierDeValidationStatusFilter
) => {
  let whereClause: Prisma.DossierDeValidationWhereInput = { isActive: true };
  const excludeArchivedAndDroppedOutCandidacy: Prisma.DossierDeValidationWhereInput =
    {
      candidacy: {
        candidacyStatuses: { none: { isActive: true, status: "ARCHIVE" } },
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
    case "PENDING":
    case "INCOMPLETE":
      whereClause = {
        ...whereClause,
        decision: statusFilter,
        ...excludeArchivedAndDroppedOutCandidacy,
      };
      break;
  }
  return whereClause;
};
