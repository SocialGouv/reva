const candidacyStatusValues = {
  ARCHIVE: -1,
  PROJET: 0,
  VALIDATION: 1,
  PRISE_EN_CHARGE: 1,
  PARCOURS_ENVOYE: 3,
  PARCOURS_CONFIRME: 5,
  DOSSIER_FAISABILITE_INCOMPLET: 5,
  DOSSIER_FAISABILITE_ENVOYE: 6,
  DOSSIER_FAISABILITE_RECEVABLE: 7,
  DOSSIER_FAISABILITE_NON_RECEVABLE: 7,
  DEMANDE_FINANCEMENT_ENVOYE: 8,
  DOSSIER_DE_VALIDATION_SIGNALE: 9,
  DOSSIER_DE_VALIDATION_ENVOYE: 10,
  DEMANDE_PAIEMENT_ENVOYEE: 11,
};

type CandidacyStatus = keyof typeof candidacyStatusValues;

export const isCandidacyStatusEqualOrAbove = (
  sourceStatus: CandidacyStatus,
  targetStatus: CandidacyStatus,
) => statusValue(sourceStatus) >= statusValue(targetStatus);

const statusValue = (status: CandidacyStatus): number =>
  candidacyStatusValues[status];
