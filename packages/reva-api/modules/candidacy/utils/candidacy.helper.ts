import { CandidacyStatusStep, Prisma } from "@prisma/client";

import { CandidacyStatusFilter } from "../candidacy.types";

const getStatusFromStatusFilter = (statusFilter: string) => {
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
    case "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON":
      status = "DOSSIER_FAISABILITE_ENVOYE";
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
  statusFilter?: CandidacyStatusFilter
) => {
  let whereClause: Prisma.CandidacyWhereInput = {};
  switch (statusFilter) {
    case "PARCOURS_CONFIRME_HORS_ABANDON":
    case "PRISE_EN_CHARGE_HORS_ABANDON":
    case "PARCOURS_ENVOYE_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON":
    case "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON":
    case "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON":
    case "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON":
    case "VALIDATION_HORS_ABANDON":
    case "PROJET_HORS_ABANDON": {
      const status = getStatusFromStatusFilter(statusFilter);
      if (status !== null) {
        whereClause = {
          ...whereClause,
          candidacyDropOut: null,
          candidacyStatuses: {
            some: { AND: { isActive: true, status } },
          },
        };
      }
      break;
    }
    case "ACTIVE_HORS_ABANDON":
      whereClause = {
        ...whereClause,
        candidacyDropOut: null,
        candidacyStatuses: {
          some: {
            AND: {
              isActive: true,
              status: { notIn: ["ARCHIVE", "PROJET"] },
            },
          },
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
        candidacyStatuses: {
          some: { AND: { isActive: true, status: "ARCHIVE" } },
        },
      };
      break;
    case "REORIENTEE":
      whereClause = {
        ...whereClause,
        NOT: { reorientationReasonId: null },
        candidacyStatuses: {
          some: { AND: { isActive: true, status: "ARCHIVE" } },
        },
      };
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
              AND: [
                { isActive: true },
                {
                  certification: {
                    OR: [
                      containsFilter("label"),
                      {
                        typeDiplome: {
                          Certification: {
                            some: containsFilter("label"),
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      ],
    };
  }
  return whereClause;
};
