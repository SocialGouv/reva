import { faker } from "@faker-js/faker";
import { Decimal } from "@prisma/client/runtime/library";

import { Gender } from "@/modules/candidate/candidate.types";

const zero = new Decimal(0);

const candidateInfo = {
  candidateSecondname: faker.person.middleName(),
  candidateThirdname: faker.person.middleName(),
  candidateGender: "undisclosed" as Gender,
};

const fundingContactInfo = {
  fundingContactFirstname: faker.person.firstName(),
  fundingContactLastname: faker.person.lastName(),
  fundingContactEmail: faker.internet.email(),
  fundingContactPhone: faker.phone.number(),
};

const FUNDING_REQUEST_BASE = {
  ...candidateInfo,
  ...fundingContactInfo,
  basicSkillsCost: faker.number.int({ min: 0, max: 1000 }),
  certificateSkillsCost: faker.number.int({
    min: 0,
    max: 1000,
  }),
  collectiveCost: faker.number.int({ min: 0, max: 1000 }),
  individualCost: faker.number.int({ min: 0, max: 1000 }),
  mandatoryTrainingsCost: faker.number.int({
    min: 0,
    max: 1000,
  }),
  otherTrainingCost: faker.number.int({
    min: 0,
    max: 1000,
  }),
};

const fundingRequestBaseDecimal = {
  ...candidateInfo,
  ...fundingContactInfo,
  basicSkillsCost: new Decimal(faker.number.int({ min: 0, max: 1000 })),
  certificateSkillsCost: new Decimal(
    faker.number.int({
      min: 0,
      max: 1000,
    }),
  ),
  collectiveCost: new Decimal(faker.number.int({ min: 0, max: 1000 })),
  individualCost: new Decimal(faker.number.int({ min: 0, max: 1000 })),
  mandatoryTrainingsCost: new Decimal(
    faker.number.int({
      min: 0,
      max: 1000,
    }),
  ),
  otherTrainingCost: new Decimal(
    faker.number.int({
      min: 0,
      max: 1000,
    }),
  ),
};

export const FUNDING_REQUEST_NO_HOURS = {
  companionId: faker.string.uuid(),
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

const FUNDING_REQUEST_FULL_CERT_OK_HOURS = {
  ...FUNDING_REQUEST_BASE,
  isPartialCertification: false,
  basicSkillsHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  certificateSkillsHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  collectiveHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  individualHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  mandatoryTrainingsHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  otherTrainingHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
};

export const FUNDING_REQUEST_FULL_CERT_OK_HOURS_DECIMAL = {
  ...fundingRequestBaseDecimal,
  basicSkillsHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.basicSkillsHourCount,
  ),
  certificateSkillsHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.certificateSkillsHourCount,
  ),
  collectiveHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.collectiveHourCount,
  ),
  individualHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.individualHourCount,
  ),
  mandatoryTrainingsHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.mandatoryTrainingsHourCount,
  ),
  otherTrainingHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.otherTrainingHourCount,
  ),
};
