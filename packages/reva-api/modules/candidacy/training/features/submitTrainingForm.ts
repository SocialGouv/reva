import {
  existsCandidacyHavingHadStatus,
  updateCandidacyStatus,
  updateTrainingInformations,
} from "modules/candidacy/database/candidacies";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../shared/error/functionalError";

export const submitTraining = async (params: {
  candidacyId: string;
  training: {
    basicSkillIds: string[];
    mandatoryTrainingIds: string[];
    certificateSkills: string;
    otherTraining: string;
    individualHourCount: number;
    collectiveHourCount: number;
    additionalHourCount: number;
    isCertificationPartial: boolean;
  };
}) => {
  const { candidacyId, training } = params;

  // Check if candidacy is not already funding
  const existsCandidacyWithFunding = await existsCandidacyHavingHadStatus({
    candidacyId,
    status: "DEMANDE_FINANCEMENT_ENVOYE",
  });

  if (existsCandidacyWithFunding) {
    throw new FunctionalError(
      FunctionalCodeError.TRAINING_FORM_NOT_SUBMITTED,
      `Ce parcours ne peut pas être envoyé car la candidature fait l'objet d'une demande de financement.`,
    );
  }

  // Check if candidacy is taken over
  const existsCandidacyTakenOver = await existsCandidacyHavingHadStatus({
    candidacyId,
    status: "PRISE_EN_CHARGE",
  });

  if (!existsCandidacyTakenOver) {
    throw new FunctionalError(
      FunctionalCodeError.TRAINING_FORM_NOT_SUBMITTED,
      `Ce parcours ne peut pas être envoyé car la candidature n'est pas encore prise en charge.`,
    );
  }

  // Update training informations
  try {
    await updateTrainingInformations({ candidacyId, training });
  } catch (_) {
    throw new FunctionalError(
      FunctionalCodeError.TRAINING_FORM_NOT_SUBMITTED,
      `Erreur lors de la mise à jour du parcours candidat`,
    );
  }

  // Update candidacy status
  try {
    await updateCandidacyStatus({
      candidacyId,
      status: "PARCOURS_ENVOYE",
    });
  } catch (_) {
    throw new FunctionalError(
      FunctionalCodeError.TRAINING_FORM_NOT_SUBMITTED,
      `Erreur lors du changement de status de la candidature ${candidacyId}`,
    );
  }
};
