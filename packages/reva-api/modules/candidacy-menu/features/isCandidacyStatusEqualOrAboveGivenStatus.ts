import { CandidacyStatusStep } from "@prisma/client";

export const isCandidacyStatusEqualOrAboveGivenStatus =
  (currentStatus: CandidacyStatusStep) => (status: CandidacyStatusStep) => {
    return (
      statusToProgressPosition(currentStatus) >=
      statusToProgressPosition(status)
    );
  };

const statusToProgressPosition = (status: CandidacyStatusStep) => {
  switch (status) {
    case "ARCHIVE":
      return -1;
    case "PROJET":
      return 0;
    case "VALIDATION":
      return 1;
    case "PRISE_EN_CHARGE":
      return 1;
    case "PARCOURS_ENVOYE":
      return 3;
    case "PARCOURS_CONFIRME":
      return 5;
    case "DOSSIER_FAISABILITE_INCOMPLET":
      return 5;
    case "DOSSIER_FAISABILITE_ENVOYE":
      return 6;
    case "DOSSIER_FAISABILITE_RECEVABLE":
      return 7;
    case "DOSSIER_FAISABILITE_NON_RECEVABLE":
      return 7;
    case "DEMANDE_FINANCEMENT_ENVOYE":
      return 8;
    case "DOSSIER_DE_VALIDATION_SIGNALE":
      return 9;
    case "DOSSIER_DE_VALIDATION_ENVOYE":
      return 10;
    case "DEMANDE_PAIEMENT_ENVOYEE":
      return 11;
    default:
      return -1;
  }
};
