interface FundingRequestUnifvaeInput {
  candidacyId: string;
  fundingRequest: {
    companionId: string;
    individualHourCount: number;
    individualCost: number;
    collectiveHourCount: number;
    collectiveCost: number;
    basicSkillsHourCount: number;
    basicSkillsCost: number;
    mandatoryTrainingsHourCount: number;
    mandatoryTrainingsCost: number;
    certificateSkillsHourCount: number;
    certificateSkillsCost: number;
    otherTrainingHourCount: number;
    otherTrainingCost: number;
  };
}
