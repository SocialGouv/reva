import {
  CompetenceBlocsPartCompletionEnum,
  DFFDecision,
  DFFEligibilityRequirement,
} from "@prisma/client";

import { checkIsDFFReadyToBeSentToCertificationAuthorityById } from "./checkIsDFFReadyToBeSentToCertificationAuthorityById";

const ATTACHMENTS_PART_COMPLETE = true;
const ATTACHMENTS_PART_INCOMPLETE = false;
const CERTIFICATION_PART_COMPLETE = true;
const CERTIFICATION_PART_INCOMPLETE = false;
const PREREQUISITES_PART_COMPLETE = true;
const PREREQUISITES_PART_INCOMPLETE = false;
const SWORN_STATEMENT_FILE_ID = "some-file-id";
const CANDIDATE_CONFIRMATION_DATE = new Date();

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

describe("checkIsDFFReadyToBeSentToCertificationAuthorityById - Validates if a dematerialized feasibility file is ready to be sent to certification authority", () => {
  describe("Basic field validation", () => {
    test.each([
      [
        ATTACHMENTS_PART_INCOMPLETE,
        CERTIFICATION_PART_COMPLETE,
        PREREQUISITES_PART_COMPLETE,
        ELIGIBILITY_PARTIAL,
        SWORN_STATEMENT_FILE_ID,
        CANDIDATE_CONFIRMATION_DATE,
        false,
      ],
      [
        ATTACHMENTS_PART_COMPLETE,
        CERTIFICATION_PART_INCOMPLETE,
        PREREQUISITES_PART_COMPLETE,
        ELIGIBILITY_PARTIAL,
        SWORN_STATEMENT_FILE_ID,
        CANDIDATE_CONFIRMATION_DATE,
        false,
      ],
      [
        ATTACHMENTS_PART_COMPLETE,
        CERTIFICATION_PART_COMPLETE,
        PREREQUISITES_PART_INCOMPLETE,
        ELIGIBILITY_PARTIAL,
        SWORN_STATEMENT_FILE_ID,
        CANDIDATE_CONFIRMATION_DATE,
        false,
      ],
      [
        ATTACHMENTS_PART_COMPLETE,
        CERTIFICATION_PART_COMPLETE,
        PREREQUISITES_PART_COMPLETE,
        ELIGIBILITY_NULL,
        SWORN_STATEMENT_FILE_ID,
        CANDIDATE_CONFIRMATION_DATE,
        false,
      ],
      [
        ATTACHMENTS_PART_COMPLETE,
        CERTIFICATION_PART_COMPLETE,
        PREREQUISITES_PART_COMPLETE,
        ELIGIBILITY_PARTIAL,
        null,
        CANDIDATE_CONFIRMATION_DATE,
        false,
      ],
      [
        ATTACHMENTS_PART_COMPLETE,
        CERTIFICATION_PART_COMPLETE,
        PREREQUISITES_PART_COMPLETE,
        ELIGIBILITY_PARTIAL,
        SWORN_STATEMENT_FILE_ID,
        null,
        false,
      ],
      [
        ATTACHMENTS_PART_COMPLETE,
        CERTIFICATION_PART_COMPLETE,
        PREREQUISITES_PART_COMPLETE,
        ELIGIBILITY_PARTIAL,
        SWORN_STATEMENT_FILE_ID,
        CANDIDATE_CONFIRMATION_DATE,
        true,
      ],
    ])(
      "should validate basic fields (attachments: %s, certification: %s, prerequisites: %s, eligibility: %s, sworn statement: %s, confirmation: %s) -> expected: %s",
      async (
        attachments: boolean,
        certification: boolean,
        prerequisites: boolean,
        eligibility: DFFEligibilityRequirement | null,
        swornStatement: string | null,
        confirmation: Date | null,
        expected: boolean,
      ) => {
        const result =
          await checkIsDFFReadyToBeSentToCertificationAuthorityById({
            attachmentsPartComplete: attachments,
            certificationPartComplete: certification,
            prerequisitesPartComplete: prerequisites,
            competenceBlocsPartCompletion: COMPETENCE_BLOCS_TO_COMPLETE,
            aapDecision: AAP_DECISION_NULL,
            eligibilityRequirement: eligibility,
            swornStatementFileId: swornStatement,
            candidateConfirmationAt: confirmation,
          });
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
        const result =
          await checkIsDFFReadyToBeSentToCertificationAuthorityById({
            attachmentsPartComplete: ATTACHMENTS_PART_COMPLETE,
            certificationPartComplete: CERTIFICATION_PART_COMPLETE,
            prerequisitesPartComplete: PREREQUISITES_PART_COMPLETE,
            competenceBlocsPartCompletion: competenceBlocs,
            aapDecision: aapDecision,
            eligibilityRequirement: ELIGIBILITY_PARTIAL,
            swornStatementFileId: SWORN_STATEMENT_FILE_ID,
            candidateConfirmationAt: CANDIDATE_CONFIRMATION_DATE,
          });
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
        const result =
          await checkIsDFFReadyToBeSentToCertificationAuthorityById({
            attachmentsPartComplete: ATTACHMENTS_PART_COMPLETE,
            certificationPartComplete: CERTIFICATION_PART_COMPLETE,
            prerequisitesPartComplete: PREREQUISITES_PART_COMPLETE,
            competenceBlocsPartCompletion: competenceBlocs,
            aapDecision: aapDecision,
            eligibilityRequirement: ELIGIBILITY_FULL,
            swornStatementFileId: SWORN_STATEMENT_FILE_ID,
            candidateConfirmationAt: CANDIDATE_CONFIRMATION_DATE,
          });
        expect(result).toBe(expected);
      },
    );
  });
});
