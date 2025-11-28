import {
  CompetenceBlocsPartCompletionEnum,
  DFFDecision,
  DFFEligibilityRequirement,
} from "@prisma/client";

import {
  checkIsDFFReadyToBeSentToCandidateById,
  CheckIsDFFReadyToBeSentToCandidateByIdArgs,
} from "./checkIsDFFReadyToBeSentToCandidateById";

const ATTACHMENTS_PART_COMPLETE = true;
const ATTACHMENTS_PART_INCOMPLETE = false;
const CERTIFICATION_PART_COMPLETE = true;
const CERTIFICATION_PART_INCOMPLETE = false;
const PREREQUISITES_PART_COMPLETE = true;
const PREREQUISITES_PART_INCOMPLETE = false;

const COMPETENCE_BLOCS_TO_COMPLETE: CompetenceBlocsPartCompletionEnum =
  "TO_COMPLETE";
const COMPETENCE_BLOCS_IN_PROGRESS: CompetenceBlocsPartCompletionEnum =
  "IN_PROGRESS";
const COMPETENCE_BLOCS_COMPLETED: CompetenceBlocsPartCompletionEnum =
  "COMPLETED";

const AAP_DECISION_FAVORABLE: DFFDecision = "FAVORABLE";
const AAP_DECISION_NULL = null;

const ELIGIBILITY_FULL: DFFEligibilityRequirement =
  "FULL_ELIGIBILITY_REQUIREMENT";
const ELIGIBILITY_PARTIAL: DFFEligibilityRequirement =
  "PARTIAL_ELIGIBILITY_REQUIREMENT";
const ELIGIBILITY_NULL = null;

describe("checkIsDFFReadyToBeSentToCandidateById - Validates if a dematerialized feasibility file is ready to be sent to candidate based on completion status of required fields", () => {
  describe("Basic field validation", () => {
    test.each([
      [
        ATTACHMENTS_PART_INCOMPLETE,
        CERTIFICATION_PART_COMPLETE,
        PREREQUISITES_PART_COMPLETE,
        ELIGIBILITY_PARTIAL,
        false,
      ],
      [
        ATTACHMENTS_PART_COMPLETE,
        CERTIFICATION_PART_INCOMPLETE,
        PREREQUISITES_PART_COMPLETE,
        ELIGIBILITY_PARTIAL,
        false,
      ],
      [
        ATTACHMENTS_PART_COMPLETE,
        CERTIFICATION_PART_COMPLETE,
        PREREQUISITES_PART_INCOMPLETE,
        ELIGIBILITY_PARTIAL,
        false,
      ],
      [
        ATTACHMENTS_PART_INCOMPLETE,
        CERTIFICATION_PART_INCOMPLETE,
        PREREQUISITES_PART_INCOMPLETE,
        ELIGIBILITY_PARTIAL,
        false,
      ],
      [
        ATTACHMENTS_PART_COMPLETE,
        CERTIFICATION_PART_COMPLETE,
        PREREQUISITES_PART_COMPLETE,
        ELIGIBILITY_PARTIAL,
        true,
      ],
      [
        ATTACHMENTS_PART_COMPLETE,
        CERTIFICATION_PART_COMPLETE,
        PREREQUISITES_PART_COMPLETE,
        ELIGIBILITY_NULL,
        false,
      ],
    ])(
      "should validate basic fields (attachments: %s, certification: %s, prerequisites: %s, eligibility: %s) -> expected: %s",
      async (
        attachments: boolean,
        certification: boolean,
        prerequisites: boolean,
        eligibility: DFFEligibilityRequirement | null,
        expected: boolean,
      ) => {
        const dff: CheckIsDFFReadyToBeSentToCandidateByIdArgs = {
          attachmentsPartComplete: attachments,
          certificationPartComplete: certification,
          prerequisitesPartComplete: prerequisites,
          competenceBlocsPartCompletion: COMPETENCE_BLOCS_TO_COMPLETE,
          aapDecision: AAP_DECISION_NULL,
          eligibilityRequirement: eligibility,
        };

        const result = await checkIsDFFReadyToBeSentToCandidateById(dff);
        expect(result).toBe(expected);
      },
    );
  });

  describe("Partial eligibility scenarios", () => {
    test.each([
      [COMPETENCE_BLOCS_TO_COMPLETE, AAP_DECISION_NULL, true],
      [COMPETENCE_BLOCS_IN_PROGRESS, AAP_DECISION_NULL, true],
      [COMPETENCE_BLOCS_COMPLETED, AAP_DECISION_NULL, true],
      [COMPETENCE_BLOCS_TO_COMPLETE, AAP_DECISION_FAVORABLE, true],
      [COMPETENCE_BLOCS_IN_PROGRESS, AAP_DECISION_FAVORABLE, true],
      [COMPETENCE_BLOCS_COMPLETED, AAP_DECISION_FAVORABLE, true],
    ])(
      "should handle partial eligibility with competence blocs %s and AAP decision %s -> expected: %s",
      async (
        competenceBlocs: CompetenceBlocsPartCompletionEnum,
        aapDecision: DFFDecision | null,
        expected: boolean,
      ) => {
        const dff: CheckIsDFFReadyToBeSentToCandidateByIdArgs = {
          attachmentsPartComplete: ATTACHMENTS_PART_COMPLETE,
          certificationPartComplete: CERTIFICATION_PART_COMPLETE,
          prerequisitesPartComplete: PREREQUISITES_PART_COMPLETE,
          competenceBlocsPartCompletion: competenceBlocs,
          aapDecision: aapDecision,
          eligibilityRequirement: ELIGIBILITY_PARTIAL,
        };

        const result = await checkIsDFFReadyToBeSentToCandidateById(dff);
        expect(result).toBe(expected);
      },
    );
  });

  describe("Full eligibility scenarios", () => {
    test.each([
      [COMPETENCE_BLOCS_TO_COMPLETE, AAP_DECISION_FAVORABLE, false],
      [COMPETENCE_BLOCS_IN_PROGRESS, AAP_DECISION_FAVORABLE, false],
      [COMPETENCE_BLOCS_COMPLETED, AAP_DECISION_NULL, false],
      [COMPETENCE_BLOCS_COMPLETED, AAP_DECISION_FAVORABLE, true],
    ])(
      "should handle full eligibility with competence blocs %s and AAP decision %s -> expected: %s",
      async (
        competenceBlocs: CompetenceBlocsPartCompletionEnum,
        aapDecision: DFFDecision | null,
        expected: boolean,
      ) => {
        const dff: CheckIsDFFReadyToBeSentToCandidateByIdArgs = {
          attachmentsPartComplete: ATTACHMENTS_PART_COMPLETE,
          certificationPartComplete: CERTIFICATION_PART_COMPLETE,
          prerequisitesPartComplete: PREREQUISITES_PART_COMPLETE,
          competenceBlocsPartCompletion: competenceBlocs,
          aapDecision: aapDecision,
          eligibilityRequirement: ELIGIBILITY_FULL,
        };

        const result = await checkIsDFFReadyToBeSentToCandidateById(dff);
        expect(result).toBe(expected);
      },
    );
  });

  describe("Missing eligibility requirement scenarios", () => {
    test.each([
      [COMPETENCE_BLOCS_TO_COMPLETE, AAP_DECISION_NULL, false],
      [COMPETENCE_BLOCS_IN_PROGRESS, AAP_DECISION_NULL, false],
      [COMPETENCE_BLOCS_COMPLETED, AAP_DECISION_NULL, false],
      [COMPETENCE_BLOCS_TO_COMPLETE, AAP_DECISION_FAVORABLE, false],
      [COMPETENCE_BLOCS_IN_PROGRESS, AAP_DECISION_FAVORABLE, false],
      [COMPETENCE_BLOCS_COMPLETED, AAP_DECISION_FAVORABLE, false],
    ])(
      "should handle missing eligibility with competence blocs %s and AAP decision %s -> expected: %s",
      async (
        competenceBlocs: CompetenceBlocsPartCompletionEnum,
        aapDecision: DFFDecision | null,
        expected: boolean,
      ) => {
        const dff: CheckIsDFFReadyToBeSentToCandidateByIdArgs = {
          attachmentsPartComplete: ATTACHMENTS_PART_COMPLETE,
          certificationPartComplete: CERTIFICATION_PART_COMPLETE,
          prerequisitesPartComplete: PREREQUISITES_PART_COMPLETE,
          competenceBlocsPartCompletion: competenceBlocs,
          aapDecision: aapDecision,
          eligibilityRequirement: ELIGIBILITY_NULL,
        };

        const result = await checkIsDFFReadyToBeSentToCandidateById(dff);
        expect(result).toBe(expected);
      },
    );
  });
});
