import {
  CompetenceBlocsPartCompletionEnum,
  DFFDecision,
  DFFEligibilityRequirement,
  FeasibilityStatus,
  CandidacyTypeAccompagnement,
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
  feasibilityDecision?: FeasibilityStatus | null;
  feasibilityDecisionSentAt?: Date | null;
  typeAccompagnement?: CandidacyTypeAccompagnement | null;
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
  feasibilityDecision,
  feasibilityDecisionSentAt,
  typeAccompagnement = "ACCOMPAGNE",
}: CheckIsDFFReadyToBeSentToCertificationAuthorityByIdArgs) => {
  // Apres une decision INCOMPLETE, bloquer tant que le candidat n'a pas re-confirme (comparaison temporelle)
  if (feasibilityDecision === "INCOMPLETE") {
    if (typeAccompagnement === "ACCOMPAGNE") {
      if (
        !candidateConfirmationAt ||
        !feasibilityDecisionSentAt ||
        candidateConfirmationAt <= feasibilityDecisionSentAt
      ) {
        return false;
      }
    }
  }

  let isDFFReadyToBeSentToCertificationAuthority =
    attachmentsPartComplete &&
    certificationPartComplete &&
    prerequisitesPartComplete &&
    !!eligibilityRequirement &&
    !!swornStatementFileId;

  if (typeAccompagnement === "ACCOMPAGNE") {
    isDFFReadyToBeSentToCertificationAuthority =
      isDFFReadyToBeSentToCertificationAuthority && !!candidateConfirmationAt;
  }

  const isEligibilityTotal =
    eligibilityRequirement === "FULL_ELIGIBILITY_REQUIREMENT";

  if (isEligibilityTotal) {
    isDFFReadyToBeSentToCertificationAuthority =
      isDFFReadyToBeSentToCertificationAuthority &&
      competenceBlocsPartCompletion === "COMPLETED";

    if (typeAccompagnement === "ACCOMPAGNE") {
      isDFFReadyToBeSentToCertificationAuthority =
        isDFFReadyToBeSentToCertificationAuthority && !!aapDecision;
    }
  }

  return isDFFReadyToBeSentToCertificationAuthority;
};
