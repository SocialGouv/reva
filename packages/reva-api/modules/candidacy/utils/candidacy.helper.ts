import { CandidacyStatusStep, Prisma } from "@prisma/client";
import { subDays } from "date-fns";

import { candidateSearchWord } from "@/modules/candidate/utils/candidate.helpers";
import {
  CADUCITE_THRESHOLD_DAYS,
  WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
} from "@/modules/shared/candidacy/candidacyCaducite";
import { buildContainsFilterClause } from "@/modules/shared/search/search";

import { CandidacyStatusFilter } from "../candidacy.types";

export const getStatusFromStatusFilter = (statusFilter: string) => {
  let status: CandidacyStatusStep | null = null;
  switch (statusFilter) {
    case "PARCOURS_CONFIRME_HORS_ABANDON":
      status = "PARCOURS_CONFIRME";
      break;
    case "PRISE_EN_CHARGE_HORS_ABANDON":
      status = "PRISE_EN_CHARGE";
      break;
    case "PARCOURS_ENVOYE_HORS_ABANDON":
      status = "PARCOURS_ENVOYE";
      break;
    case "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON":
      status = "DOSSIER_FAISABILITE_RECEVABLE";
      break;
    case "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON":
      status = "DOSSIER_FAISABILITE_INCOMPLET";
      break;
    case "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON":
      status = "DOSSIER_FAISABILITE_NON_RECEVABLE";
      break;
    case "DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON":
      status = "DOSSIER_DE_VALIDATION_ENVOYE";
      break;
    case "DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON":
      status = "DOSSIER_DE_VALIDATION_SIGNALE";
      break;
    case "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON":
      status = "DEMANDE_FINANCEMENT_ENVOYE";
      break;
    case "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON":
      status = "DEMANDE_PAIEMENT_ENVOYEE";
      break;
    case "VALIDATION_HORS_ABANDON":
      status = "VALIDATION";
      break;
    case "PROJET_HORS_ABANDON":
      status = "PROJET";
      break;
  }
  return status;
};

export const getWhereClauseFromStatusFilter = (
  statusFilter?: CandidacyStatusFilter,
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
    case "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON":
    case "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON":
    case "VALIDATION_HORS_ABANDON":
    case "PROJET_HORS_ABANDON": {
      const status = getStatusFromStatusFilter(statusFilter);
      if (status !== null) {
        whereClause = {
          ...whereClause,
          candidacyDropOut: null,
          status,
        };
      }
      break;
    }
    case "ACTIVE_HORS_ABANDON":
      whereClause = {
        ...whereClause,
        candidacyDropOut: null,
        status: {
          notIn: ["ARCHIVE", "PROJET", "DOSSIER_FAISABILITE_NON_RECEVABLE"],
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
        candidacyDropOut: null,
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
        candidacyDropOut: null,
        Jury: {
          some: { AND: { isActive: true } },
        },
      };

      break;
    }
    case "JURY_PROGRAMME_HORS_ABANDON": {
      whereClause = {
        ...whereClause,
        candidacyDropOut: null,
        Jury: {
          some: { AND: { isActive: true, dateOfResult: null } },
        },
      };

      break;
    }
    case "JURY_PASSE_HORS_ABANDON": {
      whereClause = {
        ...whereClause,
        candidacyDropOut: null,
        Jury: {
          some: { AND: { isActive: true, dateOfResult: { not: null } } },
        },
      };

      break;
    }
    case "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON":
      whereClause = {
        ...whereClause,
        candidacyDropOut: null,
        status: {
          in: ["DOSSIER_FAISABILITE_ENVOYE", "DOSSIER_FAISABILITE_COMPLET"],
        },
      };
      break;
    case "VAE_COLLECTIVE":
      whereClause = {
        ...whereClause,
        candidacyDropOut: null,
        cohorteVaeCollectiveId: { not: null },
      };
      break;
    case "CADUQUE":
      whereClause = {
        ...WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
        ...whereClause,
        lastActivityDate: {
          lte: subDays(new Date(), CADUCITE_THRESHOLD_DAYS),
        },
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
  }
  return whereClause;
};

export const candidacySearchWord = (word: string) => {
  const containsFilter = buildContainsFilterClause(word);
  return {
    OR: [
      {
        candidate: {
          OR: [
            candidateSearchWord(word),
            { department: containsFilter("label") },
          ],
        },
      },
      { organism: containsFilter("label") },
      {
        certification: {
          OR: [containsFilter("label"), containsFilter("rncpTypeDiplome")],
        },
      },
    ],
  };
};
