import { Decimal } from "@prisma/client/runtime";
import { Left, Right } from "purify-ts";

import { Candidacy, Organism } from "../../../../domain/types/candidacy";
import {
  Candidate,
  FundingRequest,
  FundingRequestBatch,
  FundingRequestInput,
} from "../../../../domain/types/candidate";
import { FunctionalError } from "../../../../domain/types/functionalError";
import {
  createFundingRequest,
  validateFundingRequest,
} from "./createFundingRequest";

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

const defaultValidFundingRequest: FundingRequestInput = {
  id: "1234567",
  candidacyId: "123",
  basicSkills: [
    {
      id: "333",
      label: "Communication en français",
    },
  ],
  basicSkillsIds: ["333"],
  mandatoryTrainings: [
    {
      id: "444",
      label: "Systèmes d'attaches",
    },
  ],
  mandatoryTrainingsIds: ["444"],
  certificateSkills: "RCNP12 RCNP34",
  otherTraining: "other training",
  basicSkillsCost: new Decimal(20),
  basicSkillsHourCount: 1,
  certificateSkillsCost: new Decimal(20),
  certificateSkillsHourCount: 1,
  collectiveCost: new Decimal(35),
  collectiveHourCount: 15,
  diagnosisCost: new Decimal(70),
  diagnosisHourCount: 1,
  examCost: new Decimal(20),
  examHourCount: 2,
  individualCost: new Decimal(70),
  individualHourCount: 15,
  mandatoryTrainingsCost: new Decimal(20),
  mandatoryTrainingsHourCount: 1,
  postExamCost: new Decimal(70),
  postExamHourCount: 1,
  companion: { siret: "1234" } as Organism,
  numAction: "reva_20221115_00000001",
};

const validateCandidateBacSupNonFragile = (fr: FundingRequestInput) =>
  validateFundingRequest(defaultBacSupNonFragileCandidate)(
    fr,
    "afgsuTrainingId"
  );
const validateCandidateBacNonFragile = (fr: FundingRequestInput) =>
  validateFundingRequest(defaultBacNonFragileCandidate)(fr, "afgsuTrainingId");
const validateCandidateBacSupFragile = (fr: FundingRequestInput) =>
  validateFundingRequest(defaultBacSupFragileCandidate)(fr, "afgsuTrainingId");

describe("funding request", () => {
  test("should pass ", () => {
    const result = validateCandidateBacSupNonFragile(
      defaultValidFundingRequest
    );
    expect(result.isRight()).toEqual(true);
  });

  describe("rules on diagnosisHourCount and postExamHourCount", () => {
    test("should return an error when (diagnosisHourCount + postExamHourCount) > 2 for a candidate >bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisHourCount: 2,
        postExamHourCount: 1,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours doit être compris entre 0 et 2h."
      );
    });
    test("should return an error when (diagnosisHourCount + postExamHourCount) > 4 for a candidate = bac", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisHourCount: 3,
        postExamHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours doit être compris entre 0 et 4h."
      );
    });
    test("should return an ok when (diagnosisHourCount + postExamHourCount) <= 4 for a candidate = bac", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisHourCount: 2,
        postExamHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
    });
    test("should return an error when (diagnosisHourCount + postExamHourCount) > 4 for a candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisHourCount: 3,
        postExamHourCount: 2,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours doit être compris entre 0 et 4h."
      );
    });
    test("should return ok  when (diagnosisHourCount + postExamHourCount) <= 4 for a candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisHourCount: 2,
        postExamHourCount: 2,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
    });
  });

  describe("rules on diagnosisCost", () => {
    test("should return an error when diagnosisCost > 70", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        diagnosisCost: new Decimal(71),
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
        postExamCost: new Decimal(71),
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
    test("should return an error when individualCost > 70 for a candidate >bac and non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        individualCost: new Decimal(71),
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation d'Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 70 euros."
      );
    });

    test("should return an error when individualCost > 70 for a candidate <=bac and non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        individualCost: new Decimal(71),
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isLeft()).toEqual(true);
      expect((result.extract() as FunctionalError).errors).toContain(
        "Le coût horaire demandé pour la prestation d'Accompagnement méthodologique à la VAE (individuel) doit être compris entre 0 et 70 euros."
      );
    });

    test("should return an error when individualCost > 70 for a candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        individualCost: new Decimal(71),
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
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
        collectiveCost: new Decimal(36),
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
        mandatoryTrainingsCost: new Decimal(10),
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsCost.toNumber()
      ).toEqual(0);
    });
    test("should keep mandatoryTrainingsCost value when candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsCost: new Decimal(10),
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsCost.toNumber()
      ).toEqual(10);
    });
    test("should keep mandatoryTrainingsCost value when candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsCost: new Decimal(10),
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsCost.toNumber()
      ).toEqual(10);
    });
    test("should return an error when mandatoryTrainingsCost > 20 and candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainingsCost: new Decimal(21),
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
        mandatoryTrainingsCost: new Decimal(21),
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
        basicSkillsCost: new Decimal(10),
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).basicSkillsCost.toNumber()
      ).toEqual(0);
    });
    test("should keep basicSkillsCost value when candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: new Decimal(10),
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).basicSkillsCost.toNumber()
      ).toEqual(10);
    });
    test("should keep basicSkillsCost value when candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: new Decimal(10),
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).basicSkillsCost.toNumber()
      ).toEqual(10);
    });
    test("should return an error when basicSkillsCost > 20 and candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: new Decimal(21),
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
        basicSkillsCost: new Decimal(21),
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
        certificateSkillsCost: new Decimal(10),
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost.toNumber()
      ).toEqual(0);
    });
    test("should keep certificateSkillsCost value when candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkillsCost: new Decimal(10),
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost.toNumber()
      ).toEqual(10);
    });
    test("should keep certificateSkillsCost value when candidate >bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkillsCost: new Decimal(10),
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost.toNumber()
      ).toEqual(10);
    });
    test("should return an error when certificateSkillsCost > 20 and candidate <=bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkillsCost: new Decimal(21),
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
        certificateSkillsCost: new Decimal(21),
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
        examCost: new Decimal(21),
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
        basicSkillsCost: new Decimal(20),
        basicSkillsHourCount: 2,
        certificateSkillsCost: new Decimal(20),
        certificateSkillsHourCount: 2,
        collectiveCost: new Decimal(35),
        collectiveHourCount: 15,
        diagnosisCost: new Decimal(70),
        diagnosisHourCount: 1,
        examCost: new Decimal(20),
        examHourCount: 2,
        individualCost: new Decimal(70),
        individualHourCount: 15,
        mandatoryTrainingsCost: new Decimal(20),
        mandatoryTrainingsHourCount: 2,
        postExamCost: new Decimal(70),
        postExamHourCount: 1,
      };
      const result = validateCandidateBacSupNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).totalCost?.toNumber()
      ).toEqual(1755);
    });

    test("should return all hours multiply by its cost when candidate <= bac and Non fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: new Decimal(20),
        basicSkillsHourCount: 2,
        certificateSkillsCost: new Decimal(20),
        certificateSkillsHourCount: 2,
        collectiveCost: new Decimal(35),
        collectiveHourCount: 15,
        diagnosisCost: new Decimal(70),
        diagnosisHourCount: 2,
        examCost: new Decimal(20),
        examHourCount: 2,
        individualCost: new Decimal(70),
        individualHourCount: 15,
        mandatoryTrainingsCost: new Decimal(20),
        mandatoryTrainingsHourCount: 2,
        postExamCost: new Decimal(70),
        postExamHourCount: 1,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).totalCost?.toNumber()
      ).toEqual(1945);
    });

    test("should return all hours multiply by its cost when candidate > bac and fragile", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkillsCost: new Decimal(20),
        basicSkillsHourCount: 2,
        certificateSkillsCost: new Decimal(20),
        certificateSkillsHourCount: 2,
        collectiveCost: new Decimal(35),
        collectiveHourCount: 15,
        diagnosisCost: new Decimal(70),
        diagnosisHourCount: 2,
        examCost: new Decimal(20),
        examHourCount: 2,
        individualCost: new Decimal(70),
        individualHourCount: 15,
        mandatoryTrainingsCost: new Decimal(20),
        mandatoryTrainingsHourCount: 2,
        postExamCost: new Decimal(70),
        postExamHourCount: 1,
      };
      const result = validateCandidateBacSupFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).totalCost?.toNumber()
      ).toEqual(1945);
    });
  });

  describe("rules on mandatoryTrainings", () => {
    test("should set mandatory informations to 0 when mandatoryTrainings is empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainings: [],
        mandatoryTrainingsIds: [],
        mandatoryTrainingsCost: new Decimal(20),
        mandatoryTrainingsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsCost.toNumber()
      ).toEqual(0);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsHourCount
      ).toEqual(0);
    });

    test("should keep mandatory informations when mandatoryTrainings is not empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        mandatoryTrainings: [{ id: "123" }],
        mandatoryTrainingsIds: ["123"],
        mandatoryTrainingsCost: new Decimal(20),
        mandatoryTrainingsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).mandatoryTrainingsCost.toNumber()
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
        basicSkillsIds: [],
        basicSkillsCost: new Decimal(20),
        basicSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).basicSkillsCost.toNumber()
      ).toEqual(0);
      expect((result.extract() as FundingRequest).basicSkillsHourCount).toEqual(
        0
      );
    });

    test("should keep basicSkills informations when basicSkills is not empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        basicSkills: [{ id: "123" }],
        basicSkillsIds: ["123"],
        basicSkillsCost: new Decimal(20),
        basicSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).basicSkillsCost.toNumber()
      ).toEqual(20);
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
        certificateSkillsCost: new Decimal(20),
        certificateSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost.toNumber()
      ).toEqual(0);
      expect(
        (result.extract() as FundingRequest).certificateSkillsHourCount
      ).toEqual(0);
    });

    test("should set certificateSkills informations to 0 when certificateSkills is blank", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkills: "     ",
        certificateSkillsCost: new Decimal(20),
        certificateSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost.toNumber()
      ).toEqual(0);
      expect(
        (result.extract() as FundingRequest).certificateSkillsHourCount
      ).toEqual(0);
    });

    test("should keep certificateSkills informations when certificateSkills is not empty", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
        certificateSkills: "RNCP123",
        certificateSkillsCost: new Decimal(20),
        certificateSkillsHourCount: 2,
      };
      const result = validateCandidateBacNonFragile(fundingRequest);
      expect(result.isRight()).toEqual(true);
      expect(
        (result.extract() as FundingRequest).certificateSkillsCost.toNumber()
      ).toEqual(20);
      expect(
        (result.extract() as FundingRequest).certificateSkillsHourCount
      ).toEqual(2);
    });
  });

  describe("tests on feature code", () => {
    it("should not throw an error if everything is ok", async () => {
      const cfr = createFundingRequest({
        createFundingRequest: (params: {
          candidacyId: string;
          fundingRequest: FundingRequest;
        }) =>
          Promise.resolve(
            Right({
              ...params.fundingRequest,
              basicSkills: params.fundingRequest.basicSkills.map((b: any) => ({
                basicSkill: b,
              })),
              mandatoryTrainings: params.fundingRequest.mandatoryTrainings.map(
                (m: any) => ({
                  training: m,
                })
              ),
            })
          ),
        existsCandidacyWithActiveStatuses: () => Promise.resolve(Right(true)),
        hasRole: () => true,
        getCandidacyFromId: () =>
          Promise.resolve(
            Right({ certification: { rncpId: "1234" } } as Candidacy)
          ),
        getCandidateByCandidacyId: () =>
          Promise.resolve(
            Right({
              highestDegree: { level: 4 },
              vulnerabilityIndicator: { label: "Vide" },
            } as Candidate)
          ),
        createFundingRequestBatch: () =>
          Promise.resolve(Right({} as FundingRequestBatch)),
        getTrainings: () => Promise.resolve(Right([])),
      });
      const result = await cfr({
        candidacyId: "1234",
        fundingRequest: defaultValidFundingRequest,
      });
      expect(result.isRight()).toEqual(true);
    }),
      it("should throw an error if createFundingRequestBatch fails", async () => {
        const cfr = createFundingRequest({
          createFundingRequest: (params: {
            candidacyId: string;
            fundingRequest: FundingRequest;
          }) =>
            Promise.resolve(
              Right({
                ...params.fundingRequest,
                basicSkills: params.fundingRequest.basicSkills.map(
                  (b: any) => ({
                    basicSkill: b,
                  })
                ),
                mandatoryTrainings:
                  params.fundingRequest.mandatoryTrainings.map((m: any) => ({
                    training: m,
                  })),
              })
            ),
          existsCandidacyWithActiveStatuses: () => Promise.resolve(Right(true)),
          hasRole: () => true,
          getCandidacyFromId: () =>
            Promise.resolve(
              Right({ certification: { rncpId: "1234" } } as Candidacy)
            ),
          getCandidateByCandidacyId: () =>
            Promise.resolve(
              Right({
                highestDegree: { level: 4 },
                vulnerabilityIndicator: { label: "Vide" },
              } as Candidate)
            ),
          createFundingRequestBatch: () => Promise.resolve(Left("Error")),
          getTrainings: () => Promise.resolve(Right([])),
        });
        const result = await cfr({
          candidacyId: "1234",
          fundingRequest: defaultValidFundingRequest,
        });
        expect(result.isLeft()).toEqual(true);
        expect(result.extract()).toEqual({
          code: "FUNDING_REQUEST_NOT_POSSIBLE",
          errors: [],
          message:
            "Erreur lors de la creation du bach de la demande de financement",
        });
      });
    it("should throw an error if candidate dropped out while in the 'PROJET' status", async () => {
      const cfr = createFundingRequest({
        createFundingRequest: (params: {
          candidacyId: string;
          fundingRequest: FundingRequest;
        }) =>
          Promise.resolve(
            Right({
              ...params.fundingRequest,
              basicSkills: params.fundingRequest.basicSkills.map((b: any) => ({
                basicSkill: b,
              })),
              mandatoryTrainings: params.fundingRequest.mandatoryTrainings.map(
                (m: any) => ({
                  training: m,
                })
              ),
            })
          ),
        existsCandidacyWithActiveStatuses: () => Promise.resolve(Right(true)),
        hasRole: () => true,
        getCandidacyFromId: () =>
          Promise.resolve(
            Right({
              certification: { rncpId: "1234" },
              candidacyDropOut: { status: "PROJET" },
            } as Candidacy)
          ),
        getCandidateByCandidacyId: () =>
          Promise.resolve(
            Right({
              highestDegree: { level: 4 },
              vulnerabilityIndicator: { label: "Vide" },
            } as Candidate)
          ),
        createFundingRequestBatch: () =>
          Promise.resolve(Right({} as FundingRequestBatch)),
        getTrainings: () => Promise.resolve(Right([])),
      });
      const result = await cfr({
        candidacyId: "1234",
        fundingRequest: defaultValidFundingRequest,
      });
      expect(result.isLeft()).toEqual(true);
    });
    it("should not throw an error if candidate dropped out while in the 'PRISE_EN_CHARGE' status and asked for diagnosis and post exam costs financing", async () => {
      const cfr = createFundingRequest({
        createFundingRequest: (params: {
          candidacyId: string;
          fundingRequest: FundingRequest;
        }) =>
          Promise.resolve(
            Right({
              ...params.fundingRequest,
              basicSkills: params.fundingRequest.basicSkills.map((b: any) => ({
                basicSkill: b,
              })),
              mandatoryTrainings: params.fundingRequest.mandatoryTrainings.map(
                (m: any) => ({
                  training: m,
                })
              ),
            })
          ),
        existsCandidacyWithActiveStatuses: () => Promise.resolve(Right(true)),
        hasRole: () => true,
        getCandidacyFromId: () =>
          Promise.resolve(
            Right({
              certification: { rncpId: "1234" },
              candidacyDropOut: { status: "PRISE_EN_CHARGE" },
            } as Candidacy)
          ),
        getCandidateByCandidacyId: () =>
          Promise.resolve(
            Right({
              highestDegree: { level: 4 },
              vulnerabilityIndicator: { label: "Vide" },
            } as Candidate)
          ),
        createFundingRequestBatch: () =>
          Promise.resolve(Right({} as FundingRequestBatch)),
        getTrainings: () => Promise.resolve(Right([])),
      });
      const result = await cfr({
        candidacyId: "1234",
        fundingRequest: {
          ...defaultValidFundingRequest,
          diagnosisCost: new Decimal(10),
          diagnosisHourCount: 2,
          postExamCost: new Decimal(10),
          postExamHourCount: 2,
          basicSkillsCost: new Decimal(0),
          basicSkillsHourCount: 0,
          certificateSkillsCost: new Decimal(0),
          certificateSkillsHourCount: 0,
          collectiveCost: new Decimal(0),
          collectiveHourCount: 0,
          examCost: new Decimal(0),
          examHourCount: 0,
          individualCost: new Decimal(0),
          individualHourCount: 0,
          mandatoryTrainingsCost: new Decimal(0),
          mandatoryTrainingsHourCount: 0,
        },
      });
      expect(result.isRight()).toEqual(true);
    });
    it("should throw an error if candidate dropped out while in the 'PRISE_EN_CHARGE' status and asked for anything beside diagnosis and post exam financing", async () => {
      const cfr = createFundingRequest({
        createFundingRequest: (params: {
          candidacyId: string;
          fundingRequest: FundingRequest;
        }) =>
          Promise.resolve(
            Right({
              ...params.fundingRequest,
              basicSkills: params.fundingRequest.basicSkills.map((b: any) => ({
                basicSkill: b,
              })),
              mandatoryTrainings: params.fundingRequest.mandatoryTrainings.map(
                (m: any) => ({
                  training: m,
                })
              ),
            })
          ),
        existsCandidacyWithActiveStatuses: () => Promise.resolve(Right(true)),
        hasRole: () => true,
        getCandidacyFromId: () =>
          Promise.resolve(
            Right({
              certification: { rncpId: "1234" },
              candidacyDropOut: { status: "PRISE_EN_CHARGE" },
            } as Candidacy)
          ),
        getCandidateByCandidacyId: () =>
          Promise.resolve(
            Right({
              highestDegree: { level: 4 },
              vulnerabilityIndicator: { label: "Vide" },
            } as Candidate)
          ),
        createFundingRequestBatch: () =>
          Promise.resolve(Right({} as FundingRequestBatch)),
        getTrainings: () => Promise.resolve(Right([])),
      });
      const result = await cfr({
        candidacyId: "1234",
        fundingRequest: {
          ...defaultValidFundingRequest,
          diagnosisCost: 10,
          diagnosisHourCount: 2,
          postExamCost: 10,
          postExamHourCount: 2,
          basicSkillsCost: 0,
          basicSkillsHourCount: 0,
          certificateSkillsCost: 0,
          certificateSkillsHourCount: 0,
          collectiveCost: 0,
          collectiveHourCount: 0,
          examCost: 0,
          examHourCount: 10,
          individualCost: 2,
          individualHourCount: 0,
          mandatoryTrainingsCost: 0,
          mandatoryTrainingsHourCount: 0,
        },
      });
      expect(result.isLeft()).toEqual(true);
    });
  });
});
