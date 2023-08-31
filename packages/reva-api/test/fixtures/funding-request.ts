import { Decimal } from "@prisma/client/runtime";

import { Gender } from "../../modules/candidate/candidate.types";

const dummyUuid = "123456789abc-1234-1234-12345678-1234";

export const candidacyId = dummyUuid;
const zero = new Decimal(0);

const candidateInfo = {
  candidateSecondname: "Coco",
  candidateThirdname: "Bello",
  candidateGender: "undisclosed" as Gender,
};

const fundingContactInfo = {
  fundingContactFirstname: "Gustave",
  fundingContactLastname: "Flaubert",
  fundingContactEmail: "gus-flo@hachette.fr",
  fundingContactPhone: "0123456789",
};

const fundingRequestBase = {
  companionId: dummyUuid,
  ...candidateInfo,
  ...fundingContactInfo,
  basicSkillsCost: new Decimal(1),
  certificateSkillsCost: new Decimal(1),
  collectiveCost: new Decimal(1),
  individualCost: new Decimal(1),
  mandatoryTrainingsCost: new Decimal(1),
  otherTrainingCost: new Decimal(1),
};

export const fundingRequestNoHours = {
  companionId: dummyUuid,
  ...candidateInfo,
  ...fundingContactInfo,
  basicSkillsCost: zero,
  certificateSkillsCost: zero,
  collectiveCost: zero,
  individualCost: zero,
  mandatoryTrainingsCost: zero,
  otherTrainingCost: zero,
  basicSkillsHourCount: zero,
  certificateSkillsHourCount: zero,
  collectiveHourCount: zero,
  individualHourCount: zero,
  mandatoryTrainingsHourCount: zero,
  otherTrainingHourCount: zero,
  isPartialCertification: false,
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
