import {
  candidacyId,
  fundingRequestFullCertOkHours,
} from "../../../../../test/fixtures/funding-request";
import { validHoursCountAndCosts } from "./valid-numbers";

test("Should yield an error when a number is negative", () => {
  const errors = validHoursCountAndCosts({
    candidacyId,
    fundingRequest: {
      ...fundingRequestFullCertOkHours,
      individualCost: -3,
    },
  });
  expect(errors.length).toBe(1);
  expect(errors[0].fieldName).toBe("individualCost");
  expect(errors[0].message).toContain("numérique");
});

test("Should yield an error when an hour count is not multiple of 0,5", () => {
  const errors = validHoursCountAndCosts({
    candidacyId,
    fundingRequest: {
      ...fundingRequestFullCertOkHours,
      basicSkillsHourCount: 2.3,
      basicSkillsCost: 34.12,
    },
  });
  expect(errors.length).toBe(1);
  expect(errors[0].fieldName).toBe("basicSkillsHourCount");
  expect(errors[0].message).toContain("multiple");
});
