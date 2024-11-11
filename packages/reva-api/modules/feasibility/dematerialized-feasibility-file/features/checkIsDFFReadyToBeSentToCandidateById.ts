import {
  CompetenceBlocsPartCompletionEnum,
  DFFDecision,
  DFFEligibilityRequirement,
} from "@prisma/client";

export type CheckIsDFFReadyToBeSentToCandidateByIdArgs = {
  attachmentsPartComplete: boolean;
  certificationPartComplete: boolean;
  competenceBlocsPartCompletion: CompetenceBlocsPartCompletionEnum;
  prerequisitesPartComplete: boolean;
  aapDecision: DFFDecision | null;
  eligibilityRequirement: DFFEligibilityRequirement | null;
};

export const checkIsDFFReadyToBeSentToCandidateById = async ({
  attachmentsPartComplete,
  certificationPartComplete,
  competenceBlocsPartCompletion,
  prerequisitesPartComplete,
  aapDecision,
  eligibilityRequirement,
}: CheckIsDFFReadyToBeSentToCandidateByIdArgs) => {
  let isDFFReadyToBeSentToCandidate =
    attachmentsPartComplete &&
    certificationPartComplete &&
    prerequisitesPartComplete &&
    !!eligibilityRequirement;

  const isEligibilityTotal =
    eligibilityRequirement === "FULL_ELIGIBILITY_REQUIREMENT";

  if (isEligibilityTotal) {
    isDFFReadyToBeSentToCandidate =
      isDFFReadyToBeSentToCandidate &&
      competenceBlocsPartCompletion === "COMPLETED" &&
      !!aapDecision;
  }

  return isDFFReadyToBeSentToCandidate;
};
