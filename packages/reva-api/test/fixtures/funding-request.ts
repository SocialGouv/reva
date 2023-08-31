import { Decimal } from "@prisma/client/runtime";

import { Gender } from "../../modules/candidate/candidate.types";

const dummyUuid = "123456789abc-1234-1234-12345678-1234";

export const candidacyId = dummyUuid;

const candidateInfo = {
  candidateSecondname: "Coco",
  candidateThirdname: "Bello",
  candidateGender: "undisclosed" as Gender,
};

const fundingRequestBase = {
  companionId: dummyUuid,
  ...candidateInfo,
  basicSkillsCost: new Decimal(1),
  certificateSkillsCost: new Decimal(1),
  collectiveCost: new Decimal(1),
  individualCost: new Decimal(1),
  mandatoryTrainingsCost: new Decimal(1),
  otherTrainingCost: new Decimal(1),
};

export const fundingRequestFullCertOkHours = {
  ...fundingRequestBase,
  isPartialCertification: false,
  basicSkillsHourCount: new Decimal(1),
  certificateSkillsHourCount: new Decimal(1),
  collectiveHourCount: new Decimal(1),
  individualHourCount: new Decimal(1),
  mandatoryTrainingsHourCount: new Decimal(1),
  otherTrainingHourCount: new Decimal(1),
};
