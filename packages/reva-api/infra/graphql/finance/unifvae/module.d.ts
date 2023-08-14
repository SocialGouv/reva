interface FundingRequestUnifvaeHourFields {
  individualHourCount: Decimal;
  collectiveHourCount: Decimal;
  basicSkillsHourCount: Decimal;
  mandatoryTrainingsHourCount: Decimal;
  certificateSkillsHourCount: Decimal;
  otherTrainingHourCount: Decimal;
}

interface FundingRequestUnifvaeCostFields {
  individualCost: Decimal;
  collectiveCost: Decimal;
  basicSkillsCost: Decimal;
  mandatoryTrainingsCost: Decimal;
  certificateSkillsCost: Decimal;
  otherTrainingCost: Decimal;
}

type FundingRequestUnifvaeControlledFields = FundingRequestUnifvaeHourFields &
  FundingRequestUnifvaeCostFields;

interface FundingRequestUnifvaeInput {
  candidacyId: string;
  fundingRequest: {
    candidateFirstname: string;
    candidateFirstname: string;
    candidateFirstname: string;
    candidateFirstname: string;
    candidateGender: "man" | "woman" | "undisclosed";
  } & FundingRequestUnifvaeControlledFields;
}

type FundingRequestUnifvaeInputCompleted = FundingRequestUnifvaeInput & {
  fundingRequest: {
    isPartialCertification: boolean;
  };
};

type BusinessRulesValidationFieldname =
  keyof FundingRequestUnifvaeControlledFields;

interface BusinessRulesValidationError {
  fieldName: BusinessRulesValidationFieldname;
  message: string;
}
