import { CandidacyStatusStep } from "@prisma/client";

// Le candidat est inactif avant d'avoir un dossier de faisabilité admissible
export const INACTIF_EN_ATTENTE_TRIGGER_BEFORE_FEASIBILITY_ADMISSIBLE_DAYS = 60;
export const INACTIF_TRIGGER_BEFORE_FEASIBILITY_CANDIDACY_STATUSES: CandidacyStatusStep[] =
  [
    "PROJET",
    "PRISE_EN_CHARGE",
    "VALIDATION",
    "PARCOURS_ENVOYE",
    "PARCOURS_CONFIRME",
    "DOSSIER_FAISABILITE_INCOMPLET",
  ];

// Le candidat est inactif après avoir un dossier de faisabilité admissible
export const INACTIF_EN_ATTENTE_TRIGGER_AFTER_FEASIBILITY_ADMISSIBLE_DAYS = 165;
export const INACTIF_TRIGGER_AFTER_FEASIBILITY_CANDIDACY_STATUSES: CandidacyStatusStep[] =
  ["DOSSIER_FAISABILITE_RECEVABLE", "DOSSIER_DE_VALIDATION_SIGNALE"];

// Le candidat est en état d'inactivité confirmé après une mise en inactivité en attente
export const INACTIF_CONFIRME_TRIGGER_DAYS = 180;
