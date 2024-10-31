const candidacyStatusValues = {
  ARCHIVE: -1,
  PROJET: 0,
  VALIDATION: 1,
  PRISE_EN_CHARGE: 1,
  PARCOURS_ENVOYE: 3,
  PARCOURS_CONFIRME: 5,
  DOSSIER_FAISABILITE_INCOMPLET: 5,
  DOSSIER_FAISABILITE_ENVOYE: 6,
  DOSSIER_FAISABILITE_COMPLET: 7,
  DOSSIER_FAISABILITE_RECEVABLE: 8,
  DOSSIER_FAISABILITE_NON_RECEVABLE: 8,
  DEMANDE_FINANCEMENT_ENVOYE: 9,
  DOSSIER_DE_VALIDATION_SIGNALE: 10,
  DOSSIER_DE_VALIDATION_ENVOYE: 11,
  DEMANDE_PAIEMENT_ENVOYEE: 12,
};

type CandidacyStatus = keyof typeof candidacyStatusValues;

export const isCandidacyStatusEqualOrAbove = (
  sourceStatus: CandidacyStatus,
  targetStatus: CandidacyStatus,
) => statusValue(sourceStatus) >= statusValue(targetStatus);

const statusValue = (status: CandidacyStatus): number =>
  candidacyStatusValues[status];
