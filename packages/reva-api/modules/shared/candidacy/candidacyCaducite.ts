import { CandidacyStatusStep } from "@prisma/client";

export const CADUCITE_THRESHOLD_DAYS = 183;

const CADUCITE_VALID_STATUSES = [
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_DE_VALIDATION_SIGNALE",
  "DEMANDE_FINANCEMENT_ENVOYE",
] satisfies CandidacyStatusStep[];

const CADUCITE_VALID_STATUSES_WITH_INCOMPLETE_DOSSIER_DE_VALIDATION = [
  "DEMANDE_PAIEMENT_ENVOYEE",
] satisfies CandidacyStatusStep[];

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

export const WHERE_CLAUSE_RAW_CANDIDACY_CADUQUE_AND_ACTUALISATION = `(
          (
            candidacy.status in (${CADUCITE_VALID_STATUSES_WITH_INCOMPLETE_DOSSIER_DE_VALIDATION.map(
              (status) => `'${status}'`,
            ).join(", ")})
            and exists (
              select 1 from "dossier_de_validation" ddv
              where ddv.candidacy_id = candidacy.id
              and ddv.is_active = true
              and ddv.decision = 'INCOMPLETE'
            )
          )
          or candidacy.status in (${CADUCITE_VALID_STATUSES.map(
            (status) => `'${status}'`,
          ).join(", ")})
        )
        and exists (
          select 1 from "feasibility" f
          where f.candidacy_id = candidacy.id
          and f.is_active = true
          and f.decision = 'ADMISSIBLE'
        )
        and candidacyDropOut.candidacy_id is null
        and DATE_PART('day', NOW() - candidacy.last_activity_date) > ${CADUCITE_THRESHOLD_DAYS}`;
