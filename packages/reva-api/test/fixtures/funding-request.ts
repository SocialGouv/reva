import { Decimal } from "@prisma/client/runtime/library";

import { Gender } from "../../modules/candidate/candidate.types";

const dummyUuid = "123456789abc-1234-1234-12345678-1234";

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

export const fundingRequestSample = {
  ...fundingRequestBase,
  basicSkillsCost: 12.3,
  basicSkillsHourCount: 2.5,
  certificateSkillsCost: 21.3,
  certificateSkillsHourCount: 2,
  collectiveCost: 21.3,
  collectiveHourCount: 2,
  individualCost: 21.3,
  individualHourCount: 2,
  mandatoryTrainingsCost: 21.3,
  mandatoryTrainingsHourCount: 2,
  otherTrainingCost: 21.3,
  otherTrainingHourCount: 2.5,
};

export const paymentRequestInputBase = {
  individualEffectiveHourCount: 0,
  individualEffectiveCost: 0,
  collectiveEffectiveHourCount: 0,
  collectiveEffectiveCost: 0,
  mandatoryTrainingsEffectiveHourCount: 0,
  mandatoryTrainingsEffectiveCost: 0,
  basicSkillsEffectiveHourCount: 0,
  basicSkillsEffectiveCost: 0,
  certificateSkillsEffectiveHourCount: 0,
  certificateSkillsEffectiveCost: 0,
  otherTrainingEffectiveHourCount: 0,
  otherTrainingEffectiveCost: 0,
  invoiceNumber: "Invoice-001",
};
