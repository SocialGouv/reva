import { Decimal } from "@prisma/client/runtime";

import { fundingRequestFullCertOkHours } from "../../../../test/fixtures/funding-request";
import { valideForfaitHeures } from "./forfait-heures";

describe("individualHourCount rules", () => {
  test("Should yield an error when full certification and > 30", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: false,
      individualHourCount: new Decimal(32),
    });
    expect(errors.length).toBe(1);
    expect(errors[0].fieldName).toBe("individualHourCount");
    expect(errors[0].message).toContain("certification complète");
    expect(errors[0].message).toContain("30");
  });
  test("Should yield an error when partial certification and > 15", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: true,
      individualHourCount: new Decimal(16),
    });
    expect(errors.length).toBe(1);
    expect(errors[0].fieldName).toBe("individualHourCount");
    expect(errors[0].message).toContain("certification partielle");
    expect(errors[0].message).toContain("15");
  });
  test("Should return no error when full certification and <= 30", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: false,
      individualHourCount: new Decimal(30),
    });
    expect(errors.length).toBe(0);
  });
  test("Should return no error when partial certification and <= 15", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: true,
      individualHourCount: new Decimal(15),
    });
    expect(errors.length).toBe(0);
  });
});

describe("collectiveHourCount rules", () => {
  test("Should yield an error when full certification and > 20", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: false,
      collectiveHourCount: new Decimal(22),
    });
    expect(errors.length).toBe(1);
    expect(errors[0].fieldName).toBe("collectiveHourCount");
    expect(errors[0].message).toContain("certification complète");
    expect(errors[0].message).toContain("20");
  });
  test("Should yield an error when partial certification and > 10", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: true,
      collectiveHourCount: new Decimal(12),
    });
    expect(errors.length).toBe(1);
    expect(errors[0].fieldName).toBe("collectiveHourCount");
    expect(errors[0].message).toContain("certification partielle");
    expect(errors[0].message).toContain("10");
  });
  test("Should return no error when full certification and <= 20", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: false,
      collectiveHourCount: new Decimal(10),
    });
    expect(errors.length).toBe(0);
  });
  test("Should return no error when partial certification and <= 10", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: true,
      collectiveHourCount: new Decimal(10),
    });
    expect(errors.length).toBe(0);
  });
});

describe("complementaryTraining hours sum rules", () => {
  test("Should yield 3 errors when full certification and sum > 70", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: false,
      basicSkillsHourCount: new Decimal(68),
      mandatoryTrainingsHourCount: new Decimal(1),
      certificateSkillsHourCount: new Decimal(1),
      otherTrainingHourCount: new Decimal(1),
    });
    expect(errors.length).toBe(1);
    expect(errors[0].fieldName).toBe("GLOBAL");
    expect(errors[0].message).toContain("certification complète");
    expect(errors[0].message).toContain("70");
  });
  test("Should yield 3 errors when partial certification and sum > 35", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: true,
      basicSkillsHourCount: new Decimal(33),
      mandatoryTrainingsHourCount: new Decimal(1),
      certificateSkillsHourCount: new Decimal(1),
      otherTrainingHourCount: new Decimal(1),
    });
    expect(errors.length).toBe(1);
    expect(errors[0].fieldName).toBe("GLOBAL");
    expect(errors[0].message).toContain("certification partielle");
    expect(errors[0].message).toContain("35");
  });
  test("Should return no error when full certification and sum <= 70", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: false,
      basicSkillsHourCount: new Decimal(67),
      mandatoryTrainingsHourCount: new Decimal(1),
      certificateSkillsHourCount: new Decimal(1),
      otherTrainingHourCount: new Decimal(1),
    });
    expect(errors.length).toBe(0);
  });
  test("Should return no error when partial certification and sum <= 35", () => {
    const errors = valideForfaitHeures({
      ...fundingRequestFullCertOkHours,
      isCertificationPartial: true,
      basicSkillsHourCount: new Decimal(32),
      mandatoryTrainingsHourCount: new Decimal(1),
      certificateSkillsHourCount: new Decimal(1),
      otherTrainingHourCount: new Decimal(1),
    });
    expect(errors.length).toBe(0);
  });
});
