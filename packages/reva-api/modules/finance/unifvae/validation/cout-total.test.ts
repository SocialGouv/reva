import { Decimal } from "@prisma/client/runtime/library";

import { fundingRequestFullCertOkHours } from "../../../../test/fixtures/funding-request";
import { validateCoutTotal } from "./cout-total";

test("Should yield an error when total cost > 3200", () => {
  const errors = validateCoutTotal({
    ...fundingRequestFullCertOkHours,
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
    ...fundingRequestFullCertOkHours,
    individualCost: new Decimal(500),
    collectiveCost: new Decimal(500),
    basicSkillsCost: new Decimal(500),
    mandatoryTrainingsCost: new Decimal(500),
    certificateSkillsCost: new Decimal(500),
    otherTrainingCost: new Decimal(700),
  });
  expect(errors.length).toBe(0);
});
