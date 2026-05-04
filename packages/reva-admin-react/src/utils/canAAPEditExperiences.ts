import { CandidacyStatusStep } from "@/graphql/generated/graphql";

const LOCKED_STATUSES: CandidacyStatusStep[] = [
  "DOSSIER_FAISABILITE_ENVOYE",
  "DOSSIER_FAISABILITE_COMPLET",
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_FAISABILITE_NON_RECEVABLE",
  "DOSSIER_DE_VALIDATION_ENVOYE",
  "DOSSIER_DE_VALIDATION_SIGNALE",
];

export const canAAPEditExperiences = (
  candidacyStatus?: CandidacyStatusStep,
): boolean => {
  if (!candidacyStatus) return false;
  return !LOCKED_STATUSES.includes(candidacyStatus);
};
