import {
  CompetenceBlocsPartCompletionEnum,
  DFFDecision,
  DFFEligibilityRequirement,
} from "@prisma/client";

type CheckIsDFFReadyToBeSentToCertificationAuthorityByIdArgs = {
  attachmentsPartComplete: boolean;
  certificationPartComplete: boolean;
  competenceBlocsPartCompletion: CompetenceBlocsPartCompletionEnum;
  prerequisitesPartComplete: boolean;
  aapDecision: DFFDecision | null;
  eligibilityRequirement: DFFEligibilityRequirement | null;
  swornStatementFileId: string | null;
  candidateConfirmationAt: Date | null;
};

export const checkIsDFFReadyToBeSentToCertificationAuthorityById = async ({
  attachmentsPartComplete,
  certificationPartComplete,
  competenceBlocsPartCompletion,
  prerequisitesPartComplete,
  aapDecision,
  eligibilityRequirement,
  swornStatementFileId,
  candidateConfirmationAt,
}: CheckIsDFFReadyToBeSentToCertificationAuthorityByIdArgs) => {
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
