interface FundingRequestUnifvaeControlledFields {
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
}
interface FundingRequestUnifvaeInput {
  candidacyId: string;
  fundingRequest: {
    companionId: string;
    isPartialCertification: boolean;
    candidateFirstname: string;
    candidateFirstname: string;
    candidateFirstname: string;
    candidateFirstname: string;
    candidateGender: "man" | "woman" | "undisclosed";
  } & FundingRequestUnifvaeControlledFields;
}

interface BusinessRulesValidationError {
  fieldName: keyof FundingRequestUnifvaeControlledFields;
  message: string;
}
