import { FundingRequest } from "../types/candidate";
import { FunctionalError } from "../types/functionalError";
import { validateFundingRequest } from "./createFundingRequest";

const defaultBacSupNonFragileCandidate: any = {
  highestDegree: {
    level: 5,
  },
  vulnerabilityIndicator: {
    label: "Vide",
  },
};

const defaultBacNonFragileCandidate: any = {
  highestDegree: {
    level: 4,
  },
  vulnerabilityIndicator: {
    label: "Vide",
  },
};

const defaultBacSupFragileCandidate: any = {
  highestDegree: {
    level: 5,
  },
  vulnerabilityIndicator: {
    label: "RQTH",
  },
};

const defaultValidFundingRequest: FundingRequest = {
  id: "1234567",
  candidacyId: "123",
  basicSkills: [
    {
      id: "333",
    },
  ],
  mandatoryTrainings: [
    {
      id: "444",
    },
  ],
  certificateSkills: "RCNP12 RCNP34",
  otherTraining: "other training",
  basicSkillsCost: 20,
  basicSkillsHourCount: 1,
  certificateSkillsCost: 20,
  certificateSkillsHourCount: 1,
  collectiveCost: 35,
  collectiveHourCount: 15,
  diagnosisCost: 70,
  diagnosisHourCount: 2,
  examCost: 20,
  examHourCount: 2,
  individualCost: 70,
  individualHourCount: 15,
  mandatoryTrainingsCost: 20,
  mandatoryTrainingsHourCount: 1,
  postExamCost: 70,
  postExamHourCount: 1,
};

const validateCandidateBacSupNonFragile = validateFundingRequest(
  defaultBacSupNonFragileCandidate
);
const validateCandidateBacNonFragile = validateFundingRequest(
  defaultBacNonFragileCandidate
);
const validateCandidateBacSupFragile = validateFundingRequest(
  defaultBacSupFragileCandidate
);

describe("funding request", () => {
  test("should pass ", () => {
    const result = validateCandidateBacSupNonFragile(
      defaultValidFundingRequest
    );
    expect(result.isRight()).toEqual(true);
  });

  describe("rules on diagnosisHourCount", () => {
    test("should return an error when diagnosisHourCount > 2 for a candidate >bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisHourCount: 3,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours Diagnostique doit être compris entre 0 et 2h."
      );
    });
    test("should return an error when diagnosisHourCount > 4 for a candidate = bac", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisHourCount: 5,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours Diagnostique doit être compris entre 0 et 4h."
      );
    });
    test("should return an ok when diagnosisHourCount <= 4 for a candidate = bac", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisHourCount: 4,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
    });
    test("should return an error when diagnosisHourCount > 4 for a candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisHourCount: 5,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours Diagnostique doit être compris entre 0 et 4h."
      );
    });
    test("should return ok  when diagnosisHourCount > 4 for a candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisHourCount: 4,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
    });
  });

  describe("rules on diagnosisCost", () => {
    test("should return an error when diagnosisCost > 70", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisCost: 71,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation de l'Architecte de Parcours Diagnostique doit être compris entre 0 et 70 euros."
      );
    });
  });

  describe("rules on postExamCost", () => {
    test("should return an error when postExamCost > 70", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        postExamCost: 71,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation de l'Architecte de Parcours Post Jury doit être compris entre 0 et 70 euros."
      );
    });
  });

  describe("rules on individualHourCount", () => {
    test("should return an error when individualHourCount > 15 for a candidate >bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        individualHourCount: 16,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandé pour la prestation Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 15h."
      );
    });
    test("should return an error when individualHourCount > 30 for a candidate = bac", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        individualHourCount: 31,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandé pour la prestation Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 30h."
      );
    });
    test("should return ok when individualHourCount <= 30 for a candidate = bac", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        individualHourCount: 30,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
    });
    test("should return an error when individualHourCount > 30 for a candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        individualHourCount: 31,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandé pour la prestation Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 30h."
      );
    });
    test("should return ok when individualHourCount <= 30 for a candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        individualHourCount: 30,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
    });
  });

  describe("rules on individualCost", () => {
    test("should return an error when individualCost > 70", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        individualCost: 71,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation d'Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 70 euros."
      );
    });
  });

  describe("rules on collectiveHourCount", () => {
    test("should return an error when collectiveHourCount > 15 for a candidate >bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        collectiveHourCount: 16,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandées pour la prestation d'Accompagnement méthodologique à la VAE (collectif) doit être compris entre 0 et 15h."
      );
    });
    test("should return an error when collectiveHourCount > 30 for a candidate = bac", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        collectiveHourCount: 31,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandées pour la prestation d'Accompagnement méthodologique à la VAE (collectif) doit être compris entre 0 et 30h."
      );
    });
    test("should return ok when collectiveHourCount <= 30 for a candidate = bac", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        collectiveHourCount: 30,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
    });
    test("should return an error when collectiveHourCount <= 30 for a candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        collectiveHourCount: 30,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
    });
  });

  describe("rules on collectiveCost", () => {
    test("should return an error when collectiveCost > 35", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        collectiveCost: 36,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation Accompagnement méthodologique à la VAE (collectif) doit être compris entre 0 et 35 euros."
      );
    });
  });

  describe("rules on mandatoryTrainingsHourCount", () => {
    test("should set mandatoryTrainingsHourCount to 0 when candidate >bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsHourCount: 10,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsHourCount
      ).toEqual(0);
    });
    test("should keep mandatoryTrainingsHourCount value when candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsHourCount: 10,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsHourCount
      ).toEqual(10);
    });
    test("should keep mandatoryTrainingsHourCount value when candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsHourCount: 10,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsHourCount
      ).toEqual(10);
    });
  });

  describe("rules on mandatoryTrainingsCost", () => {
    test("should set mandatoryTrainingsCost to 0 when candidate >bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsCost: 10,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsCost
      ).toEqual(0);
    });
    test("should keep mandatoryTrainingsCost value when candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsCost: 10,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsCost
      ).toEqual(10);
    });
    test("should keep mandatoryTrainingsCost value when candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsCost: 10,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsCost
      ).toEqual(10);
    });
    test("should return an error when mandatoryTrainingsCost > 20 and candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsCost: 21,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation Formations obligatoires doit être compris entre 0 et 20 euros."
      );
    });

    test("should return an error when mandatoryTrainingsCost > 20 and candidate > bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsCost: 21,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation Formations obligatoires doit être compris entre 0 et 20 euros."
      );
    });
  });

  describe("rules on basicSkillsHourCount", () => {
    test("should set basicSkillsHourCount to 0 when candidate >bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsHourCount: 10,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).basicSkillsHourCount).toEqual(
        0
      );
    });
    test("should keep basicSkillsHourCount value when candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsHourCount: 10,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).basicSkillsHourCount).toEqual(
        10
      );
    });
    test("should keep basicSkillsHourCount value when candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsHourCount: 10,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).basicSkillsHourCount).toEqual(
        10
      );
    });
  });

  describe("rules on basicSkillsCost", () => {
    test("should set basicSkillsCost to 0 when candidate >bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: 10,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).basicSkillsCost).toEqual(0);
    });
    test("should keep basicSkillsCost value when candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: 10,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).basicSkillsCost).toEqual(10);
    });
    test("should keep basicSkillsCost value when candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: 10,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).basicSkillsCost).toEqual(10);
    });
    test("should return an error when basicSkillsCost > 20 and candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: 21,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation Compléments formatifs Savoirs de base doit être compris entre 0 et 20 euros."
      );
    });

    test("should return an error when basicSkillsCost > 20 and candidate > bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: 21,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation Compléments formatifs Savoirs de base doit être compris entre 0 et 20 euros."
      );
    });
  });

  describe("rules on certificateSkillsHourCount", () => {
    test("should set certificateSkillsHourCount to 0 when candidate >bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkillsHourCount: 10,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsHourCount
      ).toEqual(0);
    });
    test("should keep certificateSkillsHourCount value when candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkillsHourCount: 10,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsHourCount
      ).toEqual(10);
    });
    test("should keep certificateSkillsHourCount value when candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkillsHourCount: 10,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsHourCount
      ).toEqual(10);
    });
  });

  describe("rules on certificateSkillsCost", () => {
    test("should set certificateSkillsCost to 0 when candidate >bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkillsCost: 10,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost
      ).toEqual(0);
    });
    test("should keep certificateSkillsCost value when candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkillsCost: 10,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost
      ).toEqual(10);
    });
    test("should keep certificateSkillsCost value when candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkillsCost: 10,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost
      ).toEqual(10);
    });
    test("should return an error when certificateSkillsCost > 20 and candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkillsCost: 21,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation Compléments formatifs Blocs de compétences doit être compris entre 0 et 20 euros."
      );
    });

    test("should return an error when certificateSkillsCost > 20 and candidate > bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkillsCost: 21,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation Compléments formatifs Blocs de compétences doit être compris entre 0 et 20 euros."
      );
    });
  });

  describe("rules on otherTrainingHourCount", () => {
    test("should return an error when otherTrainingHourCount > 78 and candidate <= bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsHourCount: 27,
        basicSkillsHourCount: 27,
        certificateSkillsHourCount: 27,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures total prescrit pour les actes formatifs doit être compris entre 0 et 78h."
      );
    });
    test("should return an error when otherTrainingHourCount > 78 and candidate > bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsHourCount: 27,
        basicSkillsHourCount: 27,
        certificateSkillsHourCount: 27,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures total prescrit pour les actes formatifs doit être compris entre 0 et 78h."
      );
    });
  });

  describe("rules on examHourCount", () => {
    test("should return an error when examHourCount > 2", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        examHourCount: 4,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandé pour la prestation Jury doit être compris entre 0 et 2h."
      );
    });
  });

  describe("rules on examCost", () => {
    test("should return an error when examCost > 20", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        examCost: 21,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation Jury doit être compris entre 0 et 20 euros."
      );
    });
  });

  describe("rules on totalCost", () => {
    test("should return all hours multiply by its cost but with reset values when candidate > bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: 20,
        basicSkillsHourCount: 2,
        certificateSkillsCost: 20,
        certificateSkillsHourCount: 2,
        collectiveCost: 35,
        collectiveHourCount: 15,
        diagnosisCost: 70,
        diagnosisHourCount: 2,
        examCost: 20,
        examHourCount: 2,
        individualCost: 70,
        individualHourCount: 15,
        mandatoryTrainingsCost: 20,
        mandatoryTrainingsHourCount: 2,
        postExamCost: 70,
        postExamHourCount: 1,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).totalCost).toEqual(1825);
    });

    test("should return all hours multiply by its cost when candidate <= bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: 20,
        basicSkillsHourCount: 2,
        certificateSkillsCost: 20,
        certificateSkillsHourCount: 2,
        collectiveCost: 35,
        collectiveHourCount: 15,
        diagnosisCost: 70,
        diagnosisHourCount: 2,
        examCost: 20,
        examHourCount: 2,
        individualCost: 70,
        individualHourCount: 15,
        mandatoryTrainingsCost: 20,
        mandatoryTrainingsHourCount: 2,
        postExamCost: 70,
        postExamHourCount: 1,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).totalCost).toEqual(1945);
    });

    test("should return all hours multiply by its cost when candidate > bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: 20,
        basicSkillsHourCount: 2,
        certificateSkillsCost: 20,
        certificateSkillsHourCount: 2,
        collectiveCost: 35,
        collectiveHourCount: 15,
        diagnosisCost: 70,
        diagnosisHourCount: 2,
        examCost: 20,
        examHourCount: 2,
        individualCost: 70,
        individualHourCount: 15,
        mandatoryTrainingsCost: 20,
        mandatoryTrainingsHourCount: 2,
        postExamCost: 70,
        postExamHourCount: 1,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).totalCost).toEqual(1945);
    });
  });

  describe("rules on mandatoryTrainings", () => {
    test("should set mandatory informations to 0 when mandatoryTrainings is empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainings: [],
        mandatoryTrainingsCost: 20,
        mandatoryTrainingsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsCost
      ).toEqual(0);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsHourCount
      ).toEqual(0);
    });

    test("should keep mandatory informations when mandatoryTrainings is not empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainings: [{ id: 123 }],
        mandatoryTrainingsCost: 20,
        mandatoryTrainingsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsCost
      ).toEqual(20);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsHourCount
      ).toEqual(2);
    });
  });

  describe("rules on basicSkills", () => {
    test("should set basicSkills informations to 0 when basicSkills is empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkills: [],
        basicSkillsCost: 20,
        basicSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).basicSkillsCost).toEqual(0);
      expect((result.extract() as FundingRequest).basicSkillsHourCount).toEqual(
        0
      );
    });

    test("should keep mandatory informations when mandatoryTrainings is not empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkills: [{ id: 123 }],
        basicSkillsCost: 20,
        basicSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).basicSkillsCost).toEqual(20);
      expect((result.extract() as FundingRequest).basicSkillsHourCount).toEqual(
        2
      );
    });
  });

  describe("rules on basicSkills", () => {
    test("should set basicSkills informations to 0 when basicSkills is empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkills: [],
        basicSkillsCost: 20,
        basicSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).basicSkillsCost).toEqual(0);
      expect((result.extract() as FundingRequest).basicSkillsHourCount).toEqual(
        0
      );
    });

    test("should keep mandatory informations when mandatoryTrainings is not empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkills: [{ id: 123 }],
        basicSkillsCost: 20,
        basicSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect((result.extract() as FundingRequest).basicSkillsCost).toEqual(20);
      expect((result.extract() as FundingRequest).basicSkillsHourCount).toEqual(
        2
      );
    });
  });

  describe("rules on certificateSkills", () => {
    test("should set certificateSkills informations to 0 when certificateSkills is empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkills: "",
        certificateSkillsCost: 20,
        certificateSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost
      ).toEqual(0);
      expect(
        (result.extract() as FundingRequest).certificateSkillsHourCount
      ).toEqual(0);
    });

    test("should set certificateSkills informations to 0 when certificateSkills is blank", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkills: "     ",
        certificateSkillsCost: 20,
        certificateSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost
      ).toEqual(0);
      expect(
        (result.extract() as FundingRequest).certificateSkillsHourCount
      ).toEqual(0);
    });

    test("should keep certificateSkills informations when certificateSkills is not empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkills: "RNCP123",
        certificateSkillsCost: 20,
        certificateSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost
      ).toEqual(20);
      expect(
        (result.extract() as FundingRequest).certificateSkillsHourCount
      ).toEqual(2);
    });
  });
});
