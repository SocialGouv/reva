import { FeasibilityStatus, Prisma } from "@prisma/client";
import { subDays } from "date-fns";

import {
  CADUCITE_THRESHOLD_DAYS,
  WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
} from "@/modules/shared/candidacy/candidacyCaducite";

export type FeasibilityStatusFilter =
  | FeasibilityStatus
  | "ALL"
  | "ARCHIVED"
  | "DROPPED_OUT"
  | "CADUQUE"
  | "CONTESTATION"
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
    case "CADUQUE":
      whereClause = {
        ...whereClause,
        decision: "ADMISSIBLE",
        candidacy: {
          ...WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
          lastActivityDate: {
            lte: subDays(new Date(), CADUCITE_THRESHOLD_DAYS),
          },
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
