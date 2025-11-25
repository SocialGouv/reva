import { Prisma } from "@prisma/client";

import { CandidacyStatusFilter } from "../candidacy.types";

import { getStatusFromStatusFilter } from "./candidacy.helper";

/**
 * Specific version for certification authority that doesn't exclude
 * DOSSIER_FAISABILITE_NON_RECEVABLE when filtering by ACTIVE_HORS_ABANDON
 */
export const getWhereClauseFromStatusFilterForCertificationAuthority = (
  statusFilter?: CandidacyStatusFilter,
  includeDropouts = false,
) => {
  let whereClause: Prisma.CandidacyWhereInput = {};
  switch (statusFilter) {
    case "PARCOURS_CONFIRME_HORS_ABANDON":
    case "PRISE_EN_CHARGE_HORS_ABANDON":
    case "PARCOURS_ENVOYE_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON":
    case "DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON":
    case "DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON":
    case "VALIDATION_HORS_ABANDON":
    case "PROJET_HORS_ABANDON": {
      const status = getStatusFromStatusFilter(statusFilter);
      if (status !== null) {
        whereClause = {
          ...whereClause,
          ...(!includeDropouts ? { candidacyDropOut: null } : {}),
          endAccompagnementStatus: {
            notIn: ["CONFIRMED_BY_CANDIDATE", "CONFIRMED_BY_ADMIN"],
          },
          status,
        };
      }
      break;
    }
    case "ACTIVE_HORS_ABANDON":
      // For certification authority, we DO NOT exclude DOSSIER_FAISABILITE_NON_RECEVABLE
      whereClause = {
        ...whereClause,
        ...(!includeDropouts ? { candidacyDropOut: null } : {}),
        status: {
          notIn: ["ARCHIVE", "PROJET"],
        },
        endAccompagnementStatus: {
          notIn: ["CONFIRMED_BY_CANDIDATE", "CONFIRMED_BY_ADMIN"],
        },
      };
      break;
    case "ABANDON":
      whereClause = {
        ...whereClause,
        NOT: { candidacyDropOut: null },
      };
      break;
    case "ARCHIVE_HORS_ABANDON_HORS_REORIENTATION":
      whereClause = {
        ...whereClause,
        ...(!includeDropouts ? { candidacyDropOut: null } : {}),
        reorientationReasonId: null,
        status: "ARCHIVE",
      };
      break;
    case "REORIENTEE":
      whereClause = {
        ...whereClause,
        NOT: { reorientationReasonId: null },
        status: "ARCHIVE",
      };
      break;
    case "JURY_HORS_ABANDON": {
      whereClause = {
        ...whereClause,
        ...(!includeDropouts ? { candidacyDropOut: null } : {}),
        Jury: {
          some: { AND: { isActive: true } },
        },
      };

      break;
    }
    case "JURY_PROGRAMME_HORS_ABANDON": {
      whereClause = {
        ...whereClause,
        ...(!includeDropouts ? { candidacyDropOut: null } : {}),
        Jury: {
          some: { AND: { isActive: true, dateOfResult: null } },
        },
      };

      break;
    }
    case "JURY_PASSE_HORS_ABANDON": {
      whereClause = {
        ...whereClause,
        ...(!includeDropouts ? { candidacyDropOut: null } : {}),
        Jury: {
          some: { AND: { isActive: true, dateOfResult: { not: null } } },
        },
      };

      break;
    }
    case "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON":
      whereClause = {
        ...whereClause,
        ...(!includeDropouts ? { candidacyDropOut: null } : {}),
        status: {
          in: ["DOSSIER_FAISABILITE_ENVOYE", "DOSSIER_FAISABILITE_COMPLET"],
        },
      };
      break;
    case "VAE_COLLECTIVE":
      whereClause = {
        ...whereClause,
        ...(!includeDropouts ? { candidacyDropOut: null } : {}),
        cohorteVaeCollectiveId: { not: null },
      };
      break;
    case "DEMANDE_FINANCEMENT_ENVOYEE":
      whereClause = {
        ...whereClause,
        OR: [
          {
            financeModule: "unireva",
            FundingRequest: { isNot: null },
          },
          {
            financeModule: "unifvae",
            fundingRequestUnifvae: { isNot: null },
          },
        ],
      };
      break;
    case "DEMANDE_PAIEMENT_ENVOYEE":
      whereClause = {
        ...whereClause,
        OR: [
          {
            financeModule: "unireva",
            paymentRequest: {
              confirmedAt: { not: null },
            },
          },
          {
            financeModule: "unifvae",
            paymentRequestUnifvae: {
              confirmedAt: { not: null },
            },
          },
        ],
      };
      break;
    case "DEMANDE_PAIEMENT_A_ENVOYER":
      whereClause = {
        ...whereClause,
        OR: [
          {
            financeModule: "unireva",
            FundingRequest: { isNot: null },
            OR: [
              { paymentRequest: null },
              { paymentRequest: { confirmedAt: null } },
            ],
          },
          {
            financeModule: "unifvae",
            fundingRequestUnifvae: { isNot: null },
            OR: [
              { paymentRequestUnifvae: null },
              { paymentRequestUnifvae: { confirmedAt: null } },
            ],
          },
        ],
      };
      break;
    case "END_ACCOMPAGNEMENT":
      whereClause = {
        ...whereClause,
        endAccompagnementStatus: {
          in: ["CONFIRMED_BY_CANDIDATE", "CONFIRMED_BY_ADMIN"],
        },
      };
      break;
  }
  return whereClause;
};
