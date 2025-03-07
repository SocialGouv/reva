export const candidateCanSubmitCandidacyToAap = (
  hasSelectedCertification: boolean,
  hasCompletedGoals: boolean,
  hasSelectedOrganism: boolean,
  hasCompletedExperience: boolean,
  candidacyAlreadySubmitted: boolean,
) =>
  hasSelectedCertification &&
  hasCompletedGoals &&
  hasSelectedOrganism &&
  hasCompletedExperience &&
  !candidacyAlreadySubmitted;
