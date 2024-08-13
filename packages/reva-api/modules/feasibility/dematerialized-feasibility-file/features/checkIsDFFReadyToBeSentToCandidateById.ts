import { DematerializedFeasibilityFile } from "@prisma/client";

export const checkIsDFFReadyToBeSentToCandidateById = async ({
  dematerializedFeasibilityFile,
}: {
  dematerializedFeasibilityFile: DematerializedFeasibilityFile;
}) => {
  const {
    attachmentsPartComplete,
    certificationPartComplete,
    competenceBlocsPartCompletion,
    prerequisitesPartComplete,
    aapDecision,
    eligibilityRequirement,
  } = dematerializedFeasibilityFile;

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
