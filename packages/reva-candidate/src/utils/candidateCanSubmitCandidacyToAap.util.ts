export const candidateCanSubmitCandidacyToAap = ({
  hasSelectedCertification,
  hasCompletedGoals,
  hasSelectedOrganism,
  hasCompletedExperience,
  candidacyAlreadySubmitted,
}: {
  hasSelectedCertification: boolean;
  hasCompletedGoals: boolean;
  hasSelectedOrganism: boolean;
  hasCompletedExperience: boolean;
  candidacyAlreadySubmitted: boolean;
}) =>
  hasSelectedCertification &&
  hasCompletedGoals &&
  hasSelectedOrganism &&
  hasCompletedExperience &&
  !candidacyAlreadySubmitted;
