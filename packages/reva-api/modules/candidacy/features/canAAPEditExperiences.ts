import { CandidacyStatusStep } from "@prisma/client";

// Un AAP ne peut plus modifier les expériences une fois le dossier de faisabilité envoyé,
// sauf lorsque le dossier de faisabilité est marqué comme incomplet.
const LOCKED_STATUSES: CandidacyStatusStep[] = [
  "DOSSIER_FAISABILITE_ENVOYE",
  "DOSSIER_FAISABILITE_COMPLET",
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_FAISABILITE_NON_RECEVABLE",
  "DOSSIER_DE_VALIDATION_ENVOYE",
  "DOSSIER_DE_VALIDATION_SIGNALE",
  "DOSSIER_PRO",
  "CERTIFICATION",
];

export const canAAPEditExperiences = (
  candidacyStatus: CandidacyStatusStep,
): boolean => {
  return !LOCKED_STATUSES.includes(candidacyStatus);
};
