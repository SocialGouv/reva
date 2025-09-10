import { Prisma } from "@prisma/client";

import { DossierDeValidationStatusFilter } from "../types/dossierDeValidationStatusFilter.type";

export const getWhereClauseFromDossierDeValidationStatusFilter = (
  statusFilter?: DossierDeValidationStatusFilter,
) => {
  let whereClause: Prisma.DossierDeValidationWhereInput = { isActive: true };
  const excludeArchivedAndDroppedOutCandidacyAndActiveJury: Prisma.DossierDeValidationWhereInput =
    {
      candidacy: {
        status: { not: "ARCHIVE" },
        candidacyDropOut: { is: null },
        Jury: { none: { isActive: true } },
      },
    };
  switch (statusFilter) {
    case undefined:
    case "ALL":
      whereClause = {
        ...whereClause,
        ...excludeArchivedAndDroppedOutCandidacyAndActiveJury,
      };
      break;
    case "PENDING":
    case "INCOMPLETE":
    case "COMPLETE":
      whereClause = {
        ...whereClause,
        decision: statusFilter,
        ...excludeArchivedAndDroppedOutCandidacyAndActiveJury,
      };
      break;
  }
  return whereClause;
};
