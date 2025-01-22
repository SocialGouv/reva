import { CandidacyStatusStep } from "@prisma/client";

export const CADUCITE_THRESHOLD_DAYS = 183;

export const ACTUALISATION_THRESHOLD_DAYS = 166;

export const CADUCITE_VALID_STATUSES = [
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_DE_VALIDATION_SIGNALE",
  "DEMANDE_FINANCEMENT_ENVOYE",
] as CandidacyStatusStep[];

export const CADUCITE_VALID_STATUSES_WITH_INCOMPLETE_DOSSIER_DE_VALIDATION = [
  "DEMANDE_PAIEMENT_ENVOYEE",
] as CandidacyStatusStep[];

export const WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION = {
  OR: [
    {
      AND: [
        {
          status: {
            in: CADUCITE_VALID_STATUSES_WITH_INCOMPLETE_DOSSIER_DE_VALIDATION,
          },
        },
        {
          dossierDeValidation: {
            some: {
              isActive: true,
              decision: "INCOMPLETE" as const,
            },
          },
        },
      ],
    },
    {
      status: {
        in: CADUCITE_VALID_STATUSES,
      },
    },
  ],
  Feasibility: {
    some: {
      isActive: true,
      decision: "ADMISSIBLE" as const,
    },
  },
  candidacyDropOut: null,
};
