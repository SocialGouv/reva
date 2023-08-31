import { Decimal } from "@prisma/client/runtime";

import {
  candidacyId,
  fundingRequestFullCertOkHours,
} from "../../../../test/fixtures/funding-request";
import { validateComplementFormatif } from "./complement-formatif";

test("Should yield an error when sum > 70", () => {
  const errors = validateComplementFormatif({
    candidacyId,
    fundingRequest: {
      ...fundingRequestFullCertOkHours,
      mandatoryTrainingsHourCount: new Decimal(13),
      basicSkillsHourCount: undefined,
      certificateSkillsHourCount: new Decimal(12),
      otherTrainingHourCount: new Decimal(46),
    },
  });
  expect(errors.length).toBe(1);
  expect(errors[0].fieldName).toBe("GLOBAL");
  expect(errors[0].message).toContain(
    "Les compléments formatifs ne peuvent excéder 70 heures"
  );
});

test("Should be ok when sum = 70", () => {
  const errors = validateComplementFormatif({
    candidacyId,
    fundingRequest: {
      ...fundingRequestFullCertOkHours,
      mandatoryTrainingsHourCount: new Decimal(0),
      basicSkillsHourCount: new Decimal(13),
      certificateSkillsHourCount: new Decimal(12),
      otherTrainingHourCount: new Decimal(45),
    },
  });
  expect(errors.length).toBe(0);
});
