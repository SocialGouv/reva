import { Decimal } from "@prisma/client/runtime/library";

import { Gender } from "../../../candidate/candidate.types";
import { validHoursCountAndCosts } from "./valid-numbers";

const fundingRequestBase = {
  companionId: "123456789abc-1234-1234-12345678-1234",
  candidateSecondname: "Coco",
  candidateThirdname: "Bello",
  candidateGender: "undisclosed" as Gender,
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

test("Should yield an error when a number is negative", () => {
  const errors = validHoursCountAndCosts({
    ...fundingRequestFullCertOkHours,
    individualCost: new Decimal(-3),
  });
  expect(errors.length).toBe(1);
  expect(errors[0].fieldName).toBe("individualCost");
  expect(errors[0].message).toContain("positif");
});

test("Should yield an error when an hour count is not multiple of 0,5", () => {
  const errors = validHoursCountAndCosts({
    ...fundingRequestFullCertOkHours,
    basicSkillsHourCount: new Decimal(2.3),
    basicSkillsCost: new Decimal(34.12),
  });
  expect(errors.length).toBe(1);
  expect(errors[0].fieldName).toBe("basicSkillsHourCount");
  expect(errors[0].message).toContain("multiple");
});
