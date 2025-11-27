import { FeasibilitySubmissionWarning } from "./getWarningOnFeasibealitySubmissionForCandidacyId";

export const throwErrorOnFeasibilitySubmissionWarning = (
  warning: FeasibilitySubmissionWarning,
) => {
  switch (warning) {
    case FeasibilitySubmissionWarning.MAX_SUBMISSIONS_CROSS_CERTIFICATION_REACHED:
      throw new Error(
        `Nombre maximum de demandes de recevabilité atteintes sur des certifications visées en totalité pour l’année ${new Date().getFullYear()}.`,
      );
    case FeasibilitySubmissionWarning.MAX_SUBMISSIONS_UNIQUE_CERTIFICATION_REACHED:
      throw new Error(
        `Une demande de recevabilité pour cette certification visée en totalité existe déjà pour l'année ${new Date().getFullYear()}.`,
      );
    case FeasibilitySubmissionWarning.NONE:
      break;
  }
};
