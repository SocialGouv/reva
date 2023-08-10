import {
  candidacyId,
  fundingRequestFullCertOkHours,
} from "../../../../../test/fixtures/funding-request";
import { valideForfaitHeures } from "./forfait-heures";

describe("individualHourCount rules", () => {
  test("Should yield an error when full certification and > 30", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: false,
        individualHourCount: 32,
      },
    });
    expect(errors.length).toBe(1);
    expect(errors[0].fieldName).toBe("individualHourCount");
    expect(errors[0].message).toContain("certification complète");
    expect(errors[0].message).toContain("30");
  });
  test("Should yield an error when partial certification and > 15", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: true,
        individualHourCount: 16,
      },
    });
    expect(errors.length).toBe(1);
    expect(errors[0].fieldName).toBe("individualHourCount");
    expect(errors[0].message).toContain("certification partielle");
    expect(errors[0].message).toContain("15");
  });
  test("Should return no error when full certification and <= 30", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: false,
        individualHourCount: 30,
      },
    });
    expect(errors.length).toBe(0);
  });
  test("Should return no error when partial certification and <= 15", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: true,
        individualHourCount: 15,
      },
    });
    expect(errors.length).toBe(0);
  });
});

describe("collectiveHourCount rules", () => {
  test("Should yield an error when full certification and > 20", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: false,
        collectiveHourCount: 22,
      },
    });
    expect(errors.length).toBe(1);
    expect(errors[0].fieldName).toBe("collectiveHourCount");
    expect(errors[0].message).toContain("certification complète");
    expect(errors[0].message).toContain("20");
  });
  test("Should yield an error when partial certification and > 10", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: true,
        collectiveHourCount: 12,
      },
    });
    expect(errors.length).toBe(1);
    expect(errors[0].fieldName).toBe("collectiveHourCount");
    expect(errors[0].message).toContain("certification partielle");
    expect(errors[0].message).toContain("10");
  });
  test("Should return no error when full certification and <= 20", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: false,
        collectiveHourCount: 10,
      },
    });
    expect(errors.length).toBe(0);
  });
  test("Should return no error when partial certification and <= 10", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: true,
        collectiveHourCount: 10,
      },
    });
    expect(errors.length).toBe(0);
  });
});

describe("complementaryTraining hours sum rules", () => {
  test("Should yield 3 errors when full certification and sum > 70", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: false,
        basicSkillsHourCount: 68,
        mandatoryTrainingsHourCount: 1,
        certificateSkillsHourCount: 1,
        otherTrainingHourCount: 1,
      },
    });
    expect(errors.length).toBe(4);
    expect(errors[0].fieldName).toBe("mandatoryTrainingsHourCount");
    expect(errors[0].message).toContain("certification complète");
    expect(errors[0].message).toContain("70");
    expect(errors[1].fieldName).toBe("basicSkillsHourCount");
    expect(errors[1].message).toContain("certification complète");
    expect(errors[1].message).toContain("70");
    expect(errors[2].fieldName).toBe("certificateSkillsHourCount");
    expect(errors[2].message).toContain("certification complète");
    expect(errors[2].message).toContain("70");
    expect(errors[3].fieldName).toBe("otherTrainingHourCount");
    expect(errors[3].message).toContain("certification complète");
    expect(errors[3].message).toContain("70");
  });
  test("Should yield 3 errors when partial certification and sum > 35", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: true,
        basicSkillsHourCount: 33,
        mandatoryTrainingsHourCount: 1,
        certificateSkillsHourCount: 1,
        otherTrainingHourCount: 1,
      },
    });
    expect(errors.length).toBe(4);
    expect(errors[0].fieldName).toBe("mandatoryTrainingsHourCount");
    expect(errors[0].message).toContain("certification partielle");
    expect(errors[0].message).toContain("35");
    expect(errors[1].fieldName).toBe("basicSkillsHourCount");
    expect(errors[1].message).toContain("certification partielle");
    expect(errors[1].message).toContain("35");
    expect(errors[2].fieldName).toBe("certificateSkillsHourCount");
    expect(errors[2].message).toContain("certification partielle");
    expect(errors[2].message).toContain("35");
    expect(errors[3].fieldName).toBe("otherTrainingHourCount");
    expect(errors[3].message).toContain("certification partielle");
    expect(errors[3].message).toContain("35");
  });
  test("Should return no error when full certification and sum <= 70", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: false,
        basicSkillsHourCount: 67,
        mandatoryTrainingsHourCount: 1,
        certificateSkillsHourCount: 1,
        otherTrainingHourCount: 1,
      },
    });
    expect(errors.length).toBe(0);
  });
  test("Should return no error when partial certification and sum <= 35", () => {
    const errors = valideForfaitHeures({
      candidacyId,
      fundingRequest: {
        ...fundingRequestFullCertOkHours,
        isPartialCertification: true,
        basicSkillsHourCount: 32,
        mandatoryTrainingsHourCount: 1,
        certificateSkillsHourCount: 1,
        otherTrainingHourCount: 1,
      },
    });
    expect(errors.length).toBe(0);
  });
});
