import { FeasibilityStatus, Prisma } from "@prisma/client";

export type FeasibilityStatusFilter =
  | FeasibilityStatus
  | "ALL"
  | "ARCHIVED"
  | "DROPPED_OUT"
  | "VAE_COLLECTIVE";

export const excludeArchivedAndDroppedOutCandidacyAndIrrelevantStatuses: Prisma.FeasibilityWhereInput =
  {
    candidacy: {
      candidacyDropOut: { is: null },
      status: {
        not: {
          in: [
            "ARCHIVE",
            "CERTIFICATION",
            "DOSSIER_DE_VALIDATION_ENVOYE",
            "DOSSIER_DE_VALIDATION_SIGNALE",
          ],
        },
      },
    },
  };

export const excludeRejectedArchivedDraftAndDroppedOutCandidacyAndIrrelevantStatuses: Prisma.FeasibilityWhereInput =
  {
    NOT: {
      isActive: true,
      decision: { in: ["REJECTED", "DRAFT"] },
    },
    candidacy: {
      status: {
        not: {
          in: [
            "ARCHIVE",
            "CERTIFICATION",
            "DOSSIER_DE_VALIDATION_ENVOYE",
            "DOSSIER_DE_VALIDATION_SIGNALE",
          ],
        },
      },
      candidacyDropOut: { is: null },
    },
  };

export const getWhereClauseFromStatusFilter = ({
  statusFilter,
  cohorteVaeCollectiveId,
}: {
  statusFilter?: FeasibilityStatusFilter;
  cohorteVaeCollectiveId?: string;
}) => {
  let whereClause: Prisma.FeasibilityWhereInput = { isActive: true };

  switch (statusFilter) {
    case "ALL":
      whereClause = {
        ...whereClause,
        ...excludeRejectedArchivedDraftAndDroppedOutCandidacyAndIrrelevantStatuses,
      };
      break;
    case "PENDING":
    case "REJECTED":
    case "ADMISSIBLE":
    case "COMPLETE":
    case "INCOMPLETE":
      whereClause = {
        ...whereClause,
        decision: statusFilter,
        ...excludeArchivedAndDroppedOutCandidacyAndIrrelevantStatuses,
      };
      break;

    case "ARCHIVED":
      whereClause = {
        ...whereClause,
        candidacy: {
          status: "ARCHIVE",
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

    case "VAE_COLLECTIVE":
      whereClause = {
        ...whereClause,
        candidacy: cohorteVaeCollectiveId
          ? { cohorteVaeCollectiveId }
          : { cohorteVaeCollectiveId: { not: null } },
      };
      break;
  }
  return whereClause;
};
