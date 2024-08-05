import {
  existsCandidacyWithActiveStatus,
  updateCandidacyStatus,
} from "modules/candidacy/database/candidacies";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../shared/error/functionalError";

export const validateTrainingFormByCandidate = async (params: {
  candidacyId: string;
}) => {
  try {
    const existsCandidacy = await existsCandidacyWithActiveStatus({
      candidacyId: params.candidacyId,
      status: "PARCOURS_ENVOYE",
    });

    if (!existsCandidacy) {
      throw new FunctionalError(
        FunctionalCodeError.TRAINING_FORM_NOT_CONFIRMED,
        `Le parcours candidat de la candidature ${params.candidacyId} ne peut être confirmé`,
      );
    }

    const updatedCandidacy = await updateCandidacyStatus({
      candidacyId: params.candidacyId,
      status: "PARCOURS_CONFIRME",
    });

    return updatedCandidacy;
  } catch (error) {
    if (error instanceof FunctionalError) {
      throw error;
    }
    throw new FunctionalError(
      FunctionalCodeError.TRAINING_FORM_NOT_CONFIRMED,
      `Erreur lors de la confirmation du parcours candidat de la candidature ${params.candidacyId}`,
    );
  }
};
