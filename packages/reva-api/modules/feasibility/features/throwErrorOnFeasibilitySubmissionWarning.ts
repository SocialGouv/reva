import { FeasibilitySubmissionWarning } from "./getWarningOnFeasibealitySubmissionForCandidacyId";

export const throwErrorOnFeasibilitySubmissionWarning = (
  warning: FeasibilitySubmissionWarning,
) => {
  switch (warning) {
    case FeasibilitySubmissionWarning.MAX_SUBMISSIONS_CROSS_CERTIFICATION_REACHED:
      throw new Error("Nombre maximum de demandes de recevabilité atteintes");
    case FeasibilitySubmissionWarning.MAX_SUBMISSIONS_UNIQUE_CERTIFICATION_REACHED:
      throw new Error(
        "Une demande de recevabilité existe déjà pour ce diplôme",
      );
    case FeasibilitySubmissionWarning.NONE:
      break;
  }
};
