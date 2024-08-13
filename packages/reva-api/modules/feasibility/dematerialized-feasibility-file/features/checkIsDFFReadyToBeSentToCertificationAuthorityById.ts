import { DematerializedFeasibilityFile } from "@prisma/client";

export const checkIsDFFReadyToBeSentToCertificationAuthorityById = async ({
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
    swornStatementFileId,
    candidateConfirmationAt,
    eligibilityRequirement,
  } = dematerializedFeasibilityFile;

  let isDFFReadyToBeSentToCertificationAuthority =
    attachmentsPartComplete &&
    certificationPartComplete &&
    prerequisitesPartComplete &&
    !!eligibilityRequirement &&
    !!swornStatementFileId &&
    !!candidateConfirmationAt;

  const isEligibilityTotal =
    eligibilityRequirement === "FULL_ELIGIBILITY_REQUIREMENT";

  if (isEligibilityTotal) {
    isDFFReadyToBeSentToCertificationAuthority =
      isDFFReadyToBeSentToCertificationAuthority &&
      competenceBlocsPartCompletion === "COMPLETED" &&
      !!aapDecision;
  }

  return isDFFReadyToBeSentToCertificationAuthority;
};
