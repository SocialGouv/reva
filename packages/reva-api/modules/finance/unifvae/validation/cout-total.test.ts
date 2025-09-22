import { Decimal } from "@prisma/client/runtime/library";

import { FUNDING_REQUEST_NO_HOURS } from "@/test/fixtures/funding-requests.fixture";

import { validateCoutTotal } from "./cout-total";

test("Should yield an error when total cost > 3200", () => {
  const errors = validateCoutTotal({
    basicSkillsHourCount: new Decimal(1),
    mandatoryTrainingsHourCount: new Decimal(1),
    certificateSkillsHourCount: new Decimal(1),
    otherTrainingHourCount: new Decimal(1),
    collectiveHourCount: new Decimal(1),
    individualHourCount: new Decimal(1),
    maximumTotalCostAllowed: new Decimal(3200),
    individualCost: new Decimal(500),
    collectiveCost: new Decimal(500),
    basicSkillsCost: new Decimal(500),
    mandatoryTrainingsCost: new Decimal(500),
    certificateSkillsCost: new Decimal(500),
    otherTrainingCost: new Decimal(701),
  });
  expect(errors.length).toBe(1);
  expect(errors[0].fieldName).toBe("GLOBAL");
});

test("Should be ok if total cost equals 3200", () => {
  const errors = validateCoutTotal({
    ...FUNDING_REQUEST_NO_HOURS,
    maximumTotalCostAllowed: new Decimal(3200),
    individualCost: new Decimal(500),
    collectiveCost: new Decimal(500),
    basicSkillsCost: new Decimal(500),
    mandatoryTrainingsCost: new Decimal(500),
    certificateSkillsCost: new Decimal(500),
    otherTrainingCost: new Decimal(700),
  });
  expect(errors.length).toBe(0);
});
