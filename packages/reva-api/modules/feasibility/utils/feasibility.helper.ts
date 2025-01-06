import { FeasibilityStatus, Prisma } from "@prisma/client";
import { subDays } from "date-fns";
import {
  CADUCITE_THRESHOLD_DAYS,
  CADUCITE_VALID_STATUSES,
} from "../../shared/candidacy/candidacyCaducite";

export type FeasibilityStatusFilter =
  | FeasibilityStatus
  | "ALL"
  | "ARCHIVED"
  | "DROPPED_OUT"
  | "CADUQUE"
  | "CONTESTATION";

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

export const getWhereClauseFromStatusFilter = (
  statusFilter?: FeasibilityStatusFilter,
) => {
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
    case "CADUQUE":
      whereClause = {
        ...whereClause,
        decision: "ADMISSIBLE",
        candidacy: {
          lastActivityDate: {
            lte: subDays(new Date(), CADUCITE_THRESHOLD_DAYS),
          },
          status: {
            in: CADUCITE_VALID_STATUSES,
          },
          candidacyDropOut: { is: null },
          candidacyContestationCaducite: {
            none: {
              certificationAuthorityContestationDecision: {
                in: ["DECISION_PENDING", "CADUCITE_CONFIRMED"],
              },
            },
          },
        },
      };
      break;

    case "CONTESTATION":
      whereClause = {
        ...whereClause,
        candidacy: {
          candidacyContestationCaducite: {
            some: {
              certificationAuthorityContestationDecision: "DECISION_PENDING",
            },
          },
          candidacyDropOut: { is: null },
          status: { not: "ARCHIVE" },
        },
      };
      break;
  }
  return whereClause;
};
