import { CandidacyStatusStep } from "@prisma/client";

export const CADUCITE_THRESHOLD_DAYS = 183;

export const CADUCITE_VALID_STATUSES = [
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_DE_VALIDATION_SIGNALE",
  "DEMANDE_FINANCEMENT_ENVOYE",
] as CandidacyStatusStep[];
