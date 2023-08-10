import { Gender } from "../../domain/types/candidate";

const dummyUuid = "123456789abc-1234-1234-12345678-1234";

export const candidacyId = dummyUuid;

const candidateInfo = {
  candidateFirstname: "Coco",
  candidateLastname: "Bello",
  candidateGender: "undisclosed" as Gender,
};

const fundingRequestBase = {
  companionId: dummyUuid,
  ...candidateInfo,
  basicSkillsCost: 1,
  certificateSkillsCost: 1,
  collectiveCost: 1,
  individualCost: 1,
  mandatoryTrainingsCost: 1,
  otherTrainingCost: 1,
};

export const fundingRequestFullCertOkHours = {
  ...fundingRequestBase,
  isPartialCertification: false,
  basicSkillsHourCount: 1,
  certificateSkillsHourCount: 1,
  collectiveHourCount: 1,
  individualHourCount: 1,
  mandatoryTrainingsHourCount: 1,
  otherTrainingHourCount: 1,
};
