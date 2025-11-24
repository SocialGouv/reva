import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../../shared/helpers/network/requests";

import {
  DATE_NOW,
  DEFAULT_BLOCS_COMPETENCES,
  DEFAULT_BLOCS_COMPETENCES_COMPLETED,
  DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
  DEFAULT_FEASIBILITY_FILE,
  DFF_AAP_DECISION_FAVORABLE,
  DFF_AAP_DECISION_UNFAVORABLE,
  DFF_BLOCS_COMPETENCES_COMPLETED,
  DFF_CERTIFICATION_AUTHORITY_DECISION_ADMISSIBLE,
  DFF_CERTIFICATION_AUTHORITY_DECISION_INCOMPLETE,
  DFF_CERTIFICATION_AUTHORITY_DECISION_REJECTED,
  DFF_FULL_ELIGIBILITY,
  DFF_PARTIAL_ELIGIBILITY,
} from "./dff-mocks";

const CANDIDACY_ID = "57bf364b-8c8b-4ff4-889b-66917e26d7d0";
const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

const FEASIBILITY_ADMISSIBLE_DECISION = {
  ...DEFAULT_FEASIBILITY_FILE,
  decision: DFF_CERTIFICATION_AUTHORITY_DECISION_ADMISSIBLE,
  dematerializedFeasibilityFile: {
    ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
    eligibilityRequirement: DFF_FULL_ELIGIBILITY,
    certificationPartComplete: true,
    blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
    attachmentsPartComplete: true,
    prerequisitesPartComplete: true,
    aapDecision: DFF_AAP_DECISION_FAVORABLE,
    competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
    isReadyToBeSentToCandidate: true,
    sentToCandidateAt: DATE_NOW,
    swornStatementFileId: "some-file-id",
    isReadyToBeSentToCertificationAuthority: true,
  },
};

function createFeasibilityHandlers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feasibility: any = DEFAULT_FEASIBILITY_FILE,
) {
  return [
    fvae.query(
      "getCandidacyByIdForAAPFeasibilityPage",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          isCertificationPartial: false,
          organism: {
            label: "Organisme Lorem Ipsum",
            nomPublic: "Organisme Lorem Ipsum nom public",
          },
          experiences: [
            {
              id: "b2927373-1073-44d7-b494-ea78c7c56b74",
              title: "Intitulé de l'experience test",
              startedAt: 1580428800000,
              duration: "lessThanOneYear",
              description: "Description du poste test",
            },
          ],
          mandatoryTrainings: [
            {
              id: "2790458c-040f-417d-b081-1d74b715ff9b",
              label: "Equipier de Première Intervention",
            },
          ],
          goals: [
            {
              id: "bc5365e2-a208-4c19-98f9-22f15de894cd",
              label: "Trouver plus facilement un emploi",
            },
          ],
          basicSkills: [
            {
              id: "d2eac236-723b-4bb8-ae4c-5d16d320ec72",
              label: "Usage et communication numérique",
            },
          ],
          certification: {
            label:
              "Titre à finalité professionnelle Assistant de vie dépendance (ADVD)",
            codeRncp: "37780",
          },
          certificationAuthorityLocalAccounts: [
            {
              contactFullName: "Jane Doe public contact",
              contactEmail: "janedoepublic@uncertificateur.fr",
              contactPhone: "0123456789",
            },
            {
              contactFullName: "John Doe public contact",
              contactEmail: "johndoepublic@uncertificateur.fr",
              contactPhone: "023456789",
            },
          ],
          feasibility,
        },
      }),
    ),
  ];
}

async function waitForFeasibilityQueries(page: Page) {
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(page, "getCandidacyByIdForAAPFeasibilityPage"),
  ]);
}

test.describe("Candidacy Dematerialized Feasibility File Page", () => {
  test.describe("When the feasibility file is in its initial state", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createFeasibilityHandlers()],
        { scope: "test" },
      ],
    });

    test("should display all sections", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);

      await expect(page.getByTestId("eligibility-section")).toBeVisible();
      await expect(page.getByTestId("certification-section")).toBeVisible();
      await expect(
        page.getByTestId("competencies-blocks-section"),
      ).toBeVisible();
      await expect(page.getByTestId("prerequisites-section")).toBeVisible();
      await expect(page.getByTestId("decision-section")).toBeVisible();
      await expect(page.getByTestId("attachments-section")).toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-uncompleted"),
      ).toBeVisible();
      await expect(page.getByTestId("sworn-statement-section")).toBeVisible();
      await expect(
        page.getByTestId("candidate-decision-comment-section"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId(
          "send-file-certification-authority-tile-pending-validation",
        ),
      ).toBeVisible();
    });

    test("should display 'to complete' badges for eligibility, certification, decision, and attachments sections", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);

      const eligibilitySection = page.getByTestId("eligibility-section");
      await expect(
        eligibilitySection.getByTestId("to-complete-badge"),
      ).toBeVisible();
      await expect(eligibilitySection.getByRole("button")).toBeEnabled();

      const certificationSection = page.getByTestId("certification-section");
      await expect(
        certificationSection.getByTestId("to-complete-badge"),
      ).toBeVisible();
      await expect(certificationSection.getByRole("button")).toBeEnabled();

      const competenciesBlocksSection = page.getByTestId(
        "competencies-blocks-section",
      );
      await expect(
        competenciesBlocksSection.getByTestId("to-complete-badge"),
      ).not.toBeVisible();
      await expect(
        competenciesBlocksSection.getByRole("button"),
      ).not.toBeVisible();

      const prerequisitesSection = page.getByTestId("prerequisites-section");
      await expect(
        prerequisitesSection.getByTestId("to-complete-badge"),
      ).not.toBeVisible();
      await expect(prerequisitesSection.getByRole("button")).toBeDisabled();

      const decisionSection = page.getByTestId("decision-section");
      await expect(
        decisionSection.getByTestId("to-complete-badge"),
      ).toBeVisible();
      await expect(decisionSection.getByRole("button")).toBeEnabled();

      const attachmentsSection = page.getByTestId("attachments-section");
      await expect(
        attachmentsSection.getByTestId("to-complete-badge"),
      ).toBeVisible();
      await expect(attachmentsSection.getByRole("button")).toBeEnabled();
    });
  });

  test.describe("When eligibility is completed", () => {
    const feasibilityEligibilityCompleted = {
      ...DEFAULT_FEASIBILITY_FILE,
      dematerializedFeasibilityFile: {
        ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
        eligibilityRequirement: DFF_FULL_ELIGIBILITY,
      },
    };

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createFeasibilityHandlers(feasibilityEligibilityCompleted),
        ],
        { scope: "test" },
      ],
    });

    test("should display 'completed' badge for the eligibility section", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);

      const eligibilitySection = page.getByTestId("eligibility-section");
      await expect(
        eligibilitySection.getByTestId("completed-badge"),
      ).toBeVisible();

      const competenciesBlocksSection = page.getByTestId(
        "competencies-blocks-section",
      );
      await expect(
        competenciesBlocksSection.getByRole("button"),
      ).not.toBeVisible();

      const prerequisitesSection = page.getByTestId("prerequisites-section");
      await expect(prerequisitesSection.getByRole("button")).toBeDisabled();

      const decisionSection = page.getByTestId("decision-section");
      await expect(decisionSection.getByRole("button")).toBeEnabled();

      const attachmentsSection = page.getByTestId("attachments-section");
      await expect(attachmentsSection.getByRole("button")).toBeEnabled();

      await expect(
        page.getByTestId("send-file-candidate-tile-uncompleted"),
      ).toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-ready"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-sent"),
      ).not.toBeVisible();

      const swornStatementSection = page.getByTestId("sworn-statement-section");
      await expect(swornStatementSection.getByRole("button")).toBeDisabled();

      await expect(
        page.getByTestId("candidate-decision-comment-section"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId(
          "send-file-certification-authority-tile-pending-validation",
        ),
      ).toBeVisible();
    });
  });

  test.describe("When eligibility and certification are completed", () => {
    const feasibilityEligibilityAndCertificationCompleted = {
      ...DEFAULT_FEASIBILITY_FILE,
      dematerializedFeasibilityFile: {
        ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
        eligibilityRequirement: DFF_FULL_ELIGIBILITY,
        certificationPartComplete: true,
        blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES,
      },
    };

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createFeasibilityHandlers(
            feasibilityEligibilityAndCertificationCompleted,
          ),
        ],
        { scope: "test" },
      ],
    });

    test("should display 'completed' badges for the certification and eligibility sections", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);

      const eligibilitySection = page.getByTestId("eligibility-section");
      await expect(
        eligibilitySection.getByTestId("completed-badge"),
      ).toBeVisible();

      const certificationSection = page.getByTestId("certification-section");
      await expect(
        certificationSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const competenciesBlocksSection = page.getByTestId(
        "competencies-blocks-section",
      );
      await expect(competenciesBlocksSection.getByRole("button")).toBeEnabled();

      const prerequisitesSection = page.getByTestId("prerequisites-section");
      await expect(prerequisitesSection.getByRole("button")).toBeEnabled();

      const decisionSection = page.getByTestId("decision-section");
      await expect(decisionSection.getByRole("button")).toBeEnabled();

      const attachmentsSection = page.getByTestId("attachments-section");
      await expect(attachmentsSection.getByRole("button")).toBeEnabled();

      await expect(
        page.getByTestId("send-file-candidate-tile-uncompleted"),
      ).toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-ready"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-sent"),
      ).not.toBeVisible();

      const swornStatementSection = page.getByTestId("sworn-statement-section");
      await expect(swornStatementSection.getByRole("button")).toBeDisabled();

      await expect(
        page.getByTestId("candidate-decision-comment-section"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId(
          "send-file-certification-authority-tile-pending-validation",
        ),
      ).toBeVisible();
    });
  });

  test.describe("When eligibility is partial and certification is completed", () => {
    const feasibilityEligibilityPartial = {
      ...DEFAULT_FEASIBILITY_FILE,
      dematerializedFeasibilityFile: {
        ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
        eligibilityRequirement: DFF_PARTIAL_ELIGIBILITY,
        certificationPartComplete: true,
        blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES,
      },
    };

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createFeasibilityHandlers(feasibilityEligibilityPartial),
        ],
        { scope: "test" },
      ],
    });

    test("should display 'completed' badges for certification and eligibility sections", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);

      const eligibilitySection = page.getByTestId("eligibility-section");
      await expect(
        eligibilitySection.getByTestId("completed-badge"),
      ).toBeVisible();

      const certificationSection = page.getByTestId("certification-section");
      await expect(
        certificationSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const competenciesBlocksSection = page.getByTestId(
        "competencies-blocks-section",
      );
      await expect(
        competenciesBlocksSection.getByRole("button"),
      ).not.toBeVisible();

      const prerequisitesSection = page.getByTestId("prerequisites-section");
      await expect(prerequisitesSection.getByRole("button")).toBeEnabled();

      const decisionSection = page.getByTestId("decision-section");
      await expect(decisionSection.getByRole("button")).not.toBeVisible();

      const attachmentsSection = page.getByTestId("attachments-section");
      await expect(attachmentsSection.getByRole("button")).toBeEnabled();

      await expect(
        page.getByTestId("send-file-candidate-tile-uncompleted"),
      ).toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-ready"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-sent"),
      ).not.toBeVisible();

      const swornStatementSection = page.getByTestId("sworn-statement-section");
      await expect(swornStatementSection.getByRole("button")).toBeDisabled();

      await expect(
        page.getByTestId("candidate-decision-comment-section"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId(
          "send-file-certification-authority-tile-pending-validation",
        ),
      ).toBeVisible();
    });
  });

  test.describe("When all sections except send file to candidate, sworn statement, and send file to certification authority are completed", () => {
    const feasibilityEligibilityAndCertificationCompleted = {
      ...DEFAULT_FEASIBILITY_FILE,
      dematerializedFeasibilityFile: {
        ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
        eligibilityRequirement: DFF_FULL_ELIGIBILITY,
        certificationPartComplete: true,
        blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
        attachmentsPartComplete: true,
        prerequisitesPartComplete: true,
        aapDecision: DFF_AAP_DECISION_FAVORABLE,
        competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
        isReadyToBeSentToCandidate: true,
      },
    };

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createFeasibilityHandlers(
            feasibilityEligibilityAndCertificationCompleted,
          ),
        ],
        { scope: "test" },
      ],
    });

    test("should display 'completed' badges for all sections", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);

      const eligibilitySection = page.getByTestId("eligibility-section");
      await expect(
        eligibilitySection.getByTestId("completed-badge"),
      ).toBeVisible();

      const certificationSection = page.getByTestId("certification-section");
      await expect(
        certificationSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const competenciesBlocksSection = page.getByTestId(
        "competencies-blocks-section",
      );
      await expect(
        competenciesBlocksSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const prerequisitesSection = page.getByTestId("prerequisites-section");
      await expect(
        prerequisitesSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const decisionSection = page.getByTestId("decision-section");
      await expect(
        decisionSection.getByTestId("favorable-badge"),
      ).toBeVisible();

      const attachmentsSection = page.getByTestId("attachments-section");
      await expect(
        attachmentsSection.getByTestId("completed-badge"),
      ).toBeVisible();

      await expect(
        page.getByTestId("send-file-candidate-tile-uncompleted"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-ready"),
      ).toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-sent"),
      ).not.toBeVisible();

      const swornStatementSection = page.getByTestId("sworn-statement-section");
      await expect(swornStatementSection.getByRole("button")).toBeDisabled();

      await expect(
        page.getByTestId("candidate-decision-comment-section"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId(
          "send-file-certification-authority-tile-pending-validation",
        ),
      ).toBeVisible();
    });
  });

  test.describe("When the file has been sent to the candidate", () => {
    const feasibilityWithSentToCandidate = {
      ...DEFAULT_FEASIBILITY_FILE,
      dematerializedFeasibilityFile: {
        ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
        eligibilityRequirement: DFF_FULL_ELIGIBILITY,
        certificationPartComplete: true,
        blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
        attachmentsPartComplete: true,
        prerequisitesPartComplete: true,
        aapDecision: DFF_AAP_DECISION_FAVORABLE,
        competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
        isReadyToBeSentToCandidate: true,
        sentToCandidateAt: DATE_NOW,
      },
    };

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createFeasibilityHandlers(feasibilityWithSentToCandidate),
        ],
        { scope: "test" },
      ],
    });

    test("should display sent file alert and enable sworn statement button", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);

      const eligibilitySection = page.getByTestId("eligibility-section");
      await expect(
        eligibilitySection.getByTestId("completed-badge"),
      ).toBeVisible();

      const certificationSection = page.getByTestId("certification-section");
      await expect(
        certificationSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const competenciesBlocksSection = page.getByTestId(
        "competencies-blocks-section",
      );
      await expect(
        competenciesBlocksSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const prerequisitesSection = page.getByTestId("prerequisites-section");
      await expect(
        prerequisitesSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const decisionSection = page.getByTestId("decision-section");
      await expect(
        decisionSection.getByTestId("favorable-badge"),
      ).toBeVisible();

      const attachmentsSection = page.getByTestId("attachments-section");
      await expect(
        attachmentsSection.getByTestId("completed-badge"),
      ).toBeVisible();

      await expect(
        page.getByTestId("send-file-candidate-tile-sent"),
      ).toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-ready"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-uncompleted"),
      ).not.toBeVisible();

      const swornStatementSection = page.getByTestId("sworn-statement-section");
      await expect(swornStatementSection.getByRole("button")).toBeEnabled();

      await expect(
        page.getByTestId("candidate-decision-comment-section"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId(
          "send-file-certification-authority-tile-pending-validation",
        ),
      ).toBeVisible();
    });
  });

  test.describe("When the decision is marked as unfavorable", () => {
    const feasibilityUnfavorableDecision = {
      ...DEFAULT_FEASIBILITY_FILE,
      dematerializedFeasibilityFile: {
        ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
        eligibilityRequirement: DFF_FULL_ELIGIBILITY,
        certificationPartComplete: true,
        blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
        attachmentsPartComplete: true,
        prerequisitesPartComplete: true,
        aapDecision: DFF_AAP_DECISION_UNFAVORABLE,
        competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
        isReadyToBeSentToCandidate: true,
      },
    };

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createFeasibilityHandlers(feasibilityUnfavorableDecision),
        ],
        { scope: "test" },
      ],
    });

    test("should display an 'unfavorable' badge in the decision section", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);

      const eligibilitySection = page.getByTestId("eligibility-section");
      await expect(
        eligibilitySection.getByTestId("completed-badge"),
      ).toBeVisible();

      const certificationSection = page.getByTestId("certification-section");
      await expect(
        certificationSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const competenciesBlocksSection = page.getByTestId(
        "competencies-blocks-section",
      );
      await expect(
        competenciesBlocksSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const prerequisitesSection = page.getByTestId("prerequisites-section");
      await expect(
        prerequisitesSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const decisionSection = page.getByTestId("decision-section");
      await expect(
        decisionSection.getByTestId("unfavorable-badge"),
      ).toBeVisible();

      const attachmentsSection = page.getByTestId("attachments-section");
      await expect(
        attachmentsSection.getByTestId("completed-badge"),
      ).toBeVisible();

      await expect(
        page.getByTestId("send-file-candidate-tile-uncompleted"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-ready"),
      ).toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-sent"),
      ).not.toBeVisible();

      const swornStatementSection = page.getByTestId("sworn-statement-section");
      await expect(swornStatementSection.getByRole("button")).toBeDisabled();

      await expect(
        page.getByTestId("candidate-decision-comment-section"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId(
          "send-file-certification-authority-tile-pending-validation",
        ),
      ).toBeVisible();
    });

    test.describe("when candidateDecisionComment exists", () => {
      const feasibilityWithUnfavorableDecision = {
        ...DEFAULT_FEASIBILITY_FILE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          aapDecision: DFF_AAP_DECISION_UNFAVORABLE,
          candidateDecisionComment: "Candidate's comment on the decision",
        },
      };

      test.use({
        mswHandlers: [
          [
            ...aapCommonHandlers,
            ...createFeasibilityHandlers(feasibilityWithUnfavorableDecision),
          ],
          { scope: "test" },
        ],
      });

      test("should display candidate's comment when candidateDecisionComment exists", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
        await waitForFeasibilityQueries(page);

        const decisionSection = page.getByTestId("decision-section");
        await expect(
          decisionSection.getByTestId("unfavorable-badge"),
        ).toBeVisible();
        await expect(
          page.getByTestId("candidate-decision-comment-section"),
        ).toBeVisible();
      });
    });
  });

  test.describe("When the feasibility file has been sent to the candidate", () => {
    const feasibilityAllCompleted = {
      ...DEFAULT_FEASIBILITY_FILE,
      dematerializedFeasibilityFile: {
        ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
        eligibilityRequirement: DFF_FULL_ELIGIBILITY,
        certificationPartComplete: true,
        blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
        attachmentsPartComplete: true,
        prerequisitesPartComplete: true,
        aapDecision: DFF_AAP_DECISION_FAVORABLE,
        competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
        isReadyToBeSentToCandidate: true,
        sentToCandidateAt: DATE_NOW,
      },
    };

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createFeasibilityHandlers(feasibilityAllCompleted),
        ],
        { scope: "test" },
      ],
    });

    test("should enable the sworn attestation section", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);

      const eligibilitySection = page.getByTestId("eligibility-section");
      await expect(
        eligibilitySection.getByTestId("completed-badge"),
      ).toBeVisible();

      const certificationSection = page.getByTestId("certification-section");
      await expect(
        certificationSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const competenciesBlocksSection = page.getByTestId(
        "competencies-blocks-section",
      );
      await expect(
        competenciesBlocksSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const prerequisitesSection = page.getByTestId("prerequisites-section");
      await expect(
        prerequisitesSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const decisionSection = page.getByTestId("decision-section");
      await expect(
        decisionSection.getByTestId("favorable-badge"),
      ).toBeVisible();

      const attachmentsSection = page.getByTestId("attachments-section");
      await expect(
        attachmentsSection.getByTestId("completed-badge"),
      ).toBeVisible();

      await expect(
        page.getByTestId("send-file-candidate-tile-uncompleted"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-ready"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-sent"),
      ).toBeVisible();

      const swornStatementSection = page.getByTestId("sworn-statement-section");
      await expect(swornStatementSection.getByRole("button")).toBeEnabled();

      await expect(
        page.getByTestId("candidate-decision-comment-section"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId(
          "send-file-certification-authority-tile-pending-validation",
        ),
      ).toBeVisible();
    });

    test.describe("when sworn attestation is completed", () => {
      const feasibilityAllCompletedWithSwornAttestation = {
        ...DEFAULT_FEASIBILITY_FILE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: DFF_AAP_DECISION_FAVORABLE,
          competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
          isReadyToBeSentToCandidate: true,
          sentToCandidateAt: DATE_NOW,
          swornStatementFileId: "some-file-id",
          isReadyToBeSentToCertificationAuthority: true,
        },
      };

      test.use({
        mswHandlers: [
          [
            ...aapCommonHandlers,
            ...createFeasibilityHandlers(
              feasibilityAllCompletedWithSwornAttestation,
            ),
          ],
          { scope: "test" },
        ],
      });

      test("should enable the 'send to certification authority' section if the sworn attestation is completed", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
        await waitForFeasibilityQueries(page);

        const eligibilitySection = page.getByTestId("eligibility-section");
        await expect(
          eligibilitySection.getByTestId("completed-badge"),
        ).toBeVisible();

        const certificationSection = page.getByTestId("certification-section");
        await expect(
          certificationSection.getByTestId("completed-badge"),
        ).toBeVisible();

        const competenciesBlocksSection = page.getByTestId(
          "competencies-blocks-section",
        );
        await expect(
          competenciesBlocksSection.getByTestId("completed-badge"),
        ).toBeVisible();

        const prerequisitesSection = page.getByTestId("prerequisites-section");
        await expect(
          prerequisitesSection.getByTestId("completed-badge"),
        ).toBeVisible();

        const decisionSection = page.getByTestId("decision-section");
        await expect(
          decisionSection.getByTestId("favorable-badge"),
        ).toBeVisible();

        const attachmentsSection = page.getByTestId("attachments-section");
        await expect(
          attachmentsSection.getByTestId("completed-badge"),
        ).toBeVisible();

        await expect(
          page.getByTestId("send-file-candidate-tile-uncompleted"),
        ).not.toBeVisible();
        await expect(
          page.getByTestId("send-file-candidate-tile-ready"),
        ).not.toBeVisible();
        await expect(
          page.getByTestId("send-file-candidate-tile-sent"),
        ).toBeVisible();

        const swornStatementSection = page.getByTestId(
          "sworn-statement-section",
        );
        await expect(swornStatementSection.getByRole("button")).toBeEnabled();

        await expect(
          page.getByTestId("candidate-decision-comment-section"),
        ).not.toBeVisible();
        await expect(
          page.getByTestId("send-file-certification-authority-tile-ready"),
        ).toBeVisible();
      });
    });
  });
});

test.describe("When the feasibility file has been sent to the certification authority", () => {
  const feasibilityFileSent = {
    ...DEFAULT_FEASIBILITY_FILE,
    feasibilityFileSentAt: DATE_NOW as number,
    dematerializedFeasibilityFile: {
      ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
      eligibilityRequirement: DFF_FULL_ELIGIBILITY,
      certificationPartComplete: true,
      blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
      attachmentsPartComplete: true,
      prerequisitesPartComplete: true,
      aapDecision: DFF_AAP_DECISION_FAVORABLE,
      competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
      isReadyToBeSentToCandidate: true,
      sentToCandidateAt: DATE_NOW,
      swornStatementFileId: "some-file-id",
      isReadyToBeSentToCertificationAuthority: true,
      sentToCertificationAuthorityAt: DATE_NOW,
    },
  };

  test.use({
    mswHandlers: [
      [...aapCommonHandlers, ...createFeasibilityHandlers(feasibilityFileSent)],
      { scope: "test" },
    ],
  });

  test("should hide all badges and section buttons", async ({ page }) => {
    await login({ role: "aap", page });
    await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
    await waitForFeasibilityQueries(page);

    const eligibilitySection = page.getByTestId("eligibility-section");
    await expect(
      eligibilitySection.getByTestId("completed-badge"),
    ).not.toBeVisible();
    await expect(eligibilitySection.getByRole("button")).not.toBeVisible();

    const certificationSection = page.getByTestId("certification-section");
    await expect(
      certificationSection.getByTestId("completed-badge"),
    ).not.toBeVisible();
    await expect(certificationSection.getByRole("button")).not.toBeVisible();

    const competenciesBlocksSection = page.getByTestId(
      "competencies-blocks-section",
    );
    await expect(
      competenciesBlocksSection.getByTestId("completed-badge"),
    ).not.toBeVisible();
    await expect(
      competenciesBlocksSection.getByTestId(
        "competencies-blocks-section-button",
      ),
    ).not.toBeVisible();

    const prerequisitesSection = page.getByTestId("prerequisites-section");
    await expect(
      prerequisitesSection.getByTestId("completed-badge"),
    ).not.toBeVisible();
    await expect(prerequisitesSection.getByRole("button")).not.toBeVisible();

    const decisionSection = page.getByTestId("decision-section");
    await expect(
      decisionSection.getByTestId("favorable-badge"),
    ).not.toBeVisible();
    await expect(decisionSection.getByRole("button")).not.toBeVisible();

    const attachmentsSection = page.getByTestId("attachments-section");
    await expect(
      attachmentsSection.getByTestId("completed-badge"),
    ).not.toBeVisible();
    await expect(attachmentsSection.getByRole("button")).not.toBeVisible();

    await expect(
      page.getByTestId("send-file-candidate-tile-uncompleted"),
    ).not.toBeVisible();
    await expect(
      page.getByTestId("send-file-candidate-tile-ready"),
    ).not.toBeVisible();
    await expect(
      page.getByTestId("send-file-candidate-tile-sent"),
    ).toBeVisible();

    const swornStatementSection = page.getByTestId("sworn-statement-section");
    await expect(swornStatementSection.getByRole("button")).not.toBeVisible();

    await expect(
      page.getByTestId("candidate-decision-comment-section"),
    ).not.toBeVisible();
    await expect(
      page.getByTestId("send-file-certification-authority-tile-sent"),
    ).toBeVisible();
  });
});

test.describe("When the decision is ADMISSIBLE or REJECTED", () => {
  test.use({
    mswHandlers: [
      [
        ...aapCommonHandlers,
        ...createFeasibilityHandlers(FEASIBILITY_ADMISSIBLE_DECISION),
      ],
      { scope: "test" },
    ],
  });

  test("should display the feasibility summary when the decision is ADMISSIBLE", async ({
    page,
  }) => {
    await login({ role: "aap", page });
    await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
    await waitForFeasibilityQueries(page);
    await expect(page.getByTestId("dff-summary")).toBeVisible();
  });

  test("should display the contact info section with the correct information", async ({
    page,
  }) => {
    await login({ role: "aap", page });
    await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
    await waitForFeasibilityQueries(page);

    const contactInfosSection = page.getByTestId("contact-infos-section");
    const organismContactInfoTile = contactInfosSection.getByTestId(
      "organism-contact-info-tile",
    );
    await expect(organismContactInfoTile).toBeVisible();
    await expect(organismContactInfoTile).toContainText(
      "Organisme Lorem Ipsum nom public",
    );

    await expect(
      page.getByTestId("certification-authority-contact-info-tile"),
    ).toBeVisible();
    const certificationAuthorityLocalAccount = page.getByTestId(
      "certification-authority-local-account-0",
    );
    await expect(certificationAuthorityLocalAccount).toBeVisible();
    await expect(certificationAuthorityLocalAccount).toContainText(
      "Jane Doe public contact",
    );
  });

  test.describe("when the decision is REJECTED", () => {
    const feasibilityRejectedDecision = {
      ...DEFAULT_FEASIBILITY_FILE,
      decision: DFF_CERTIFICATION_AUTHORITY_DECISION_REJECTED,
      dematerializedFeasibilityFile: {
        ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
        eligibilityRequirement: DFF_FULL_ELIGIBILITY,
        certificationPartComplete: true,
        blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
        attachmentsPartComplete: true,
        prerequisitesPartComplete: true,
        aapDecision: DFF_AAP_DECISION_FAVORABLE,
        competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
        isReadyToBeSentToCandidate: true,
        sentToCandidateAt: DATE_NOW,
        swornStatementFileId: "some-file-id",
        isReadyToBeSentToCertificationAuthority: true,
      },
    };

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createFeasibilityHandlers(feasibilityRejectedDecision),
        ],
        { scope: "test" },
      ],
    });

    test("should display the feasibility summary when the decision is REJECTED", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);
      await expect(page.getByTestId("dff-summary")).toBeVisible();
    });
  });
});

test.describe("When the decision is INCOMPLETE", () => {
  test.describe("when the file is not ready to be sent to the certification authority", () => {
    const feasibilityIncompleteDecision = {
      ...DEFAULT_FEASIBILITY_FILE,
      decision: DFF_CERTIFICATION_AUTHORITY_DECISION_INCOMPLETE,
      decisionSentAt: DATE_NOW,
      decisionComment: "some-comment",
      dematerializedFeasibilityFile: {
        ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
        eligibilityRequirement: DFF_FULL_ELIGIBILITY,
        certificationPartComplete: true,
        blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
        attachmentsPartComplete: true,
        prerequisitesPartComplete: true,
        aapDecision: DFF_AAP_DECISION_FAVORABLE,
        competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
        isReadyToBeSentToCandidate: true,
        swornStatementFileId: "some-file-id",
        isReadyToBeSentToCertificationAuthority: false,
        feasibilityFileSentAt: null,
      },
    };

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createFeasibilityHandlers(feasibilityIncompleteDecision),
        ],
        { scope: "test" },
      ],
    });

    test("should display all sections as editable with completed badges when the file is not ready to be sent to the certification authority", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);

      await expect(page.getByTestId("decision-incomplete-alert")).toBeVisible();

      const eligibilitySection = page.getByTestId("eligibility-section");
      await expect(
        eligibilitySection.getByTestId("completed-badge"),
      ).toBeVisible();

      const certificationSection = page.getByTestId("certification-section");
      await expect(
        certificationSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const competenciesBlocksSection = page.getByTestId(
        "competencies-blocks-section",
      );
      await expect(
        competenciesBlocksSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const prerequisitesSection = page.getByTestId("prerequisites-section");
      await expect(
        prerequisitesSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const decisionSection = page.getByTestId("decision-section");
      await expect(
        decisionSection.getByTestId("favorable-badge"),
      ).toBeVisible();

      const attachmentsSection = page.getByTestId("attachments-section");
      await expect(
        attachmentsSection.getByTestId("completed-badge"),
      ).toBeVisible();

      await expect(
        page.getByTestId("send-file-candidate-tile-uncompleted"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-ready"),
      ).toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-sent"),
      ).not.toBeVisible();

      const swornStatementSection = page.getByTestId("sworn-statement-section");
      await expect(swornStatementSection.getByRole("button")).toBeDisabled();

      await expect(
        page.getByTestId("candidate-decision-comment-section"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId(
          "send-file-certification-authority-tile-pending-validation",
        ),
      ).toBeVisible();
    });
  });

  test.describe("when the file is ready to be sent to the certification authority", () => {
    const feasibilityIncompleteDecision = {
      ...DEFAULT_FEASIBILITY_FILE,
      decision: DFF_CERTIFICATION_AUTHORITY_DECISION_INCOMPLETE,
      dematerializedFeasibilityFile: {
        ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
        eligibilityRequirement: DFF_FULL_ELIGIBILITY,
        certificationPartComplete: true,
        blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
        attachmentsPartComplete: true,
        prerequisitesPartComplete: true,
        aapDecision: DFF_AAP_DECISION_FAVORABLE,
        competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
        isReadyToBeSentToCandidate: true,
        swornStatementFileId: "some-file-id",
        isReadyToBeSentToCertificationAuthority: true,
        feasibilityFileSentAt: null,
        sentToCandidateAt: DATE_NOW,
        candidateConfirmationAt: DATE_NOW,
      },
    };

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createFeasibilityHandlers(feasibilityIncompleteDecision),
        ],
        { scope: "test" },
      ],
    });

    test("should display all sections as editable with completed badges when the file is ready to be sent to the certification authority", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap`);
      await waitForFeasibilityQueries(page);

      const eligibilitySection = page.getByTestId("eligibility-section");
      await expect(
        eligibilitySection.getByTestId("completed-badge"),
      ).toBeVisible();

      const certificationSection = page.getByTestId("certification-section");
      await expect(
        certificationSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const competenciesBlocksSection = page.getByTestId(
        "competencies-blocks-section",
      );
      await expect(
        competenciesBlocksSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const prerequisitesSection = page.getByTestId("prerequisites-section");
      await expect(
        prerequisitesSection.getByTestId("completed-badge"),
      ).toBeVisible();

      const decisionSection = page.getByTestId("decision-section");
      await expect(
        decisionSection.getByTestId("favorable-badge"),
      ).toBeVisible();

      const attachmentsSection = page.getByTestId("attachments-section");
      await expect(
        attachmentsSection.getByTestId("completed-badge"),
      ).toBeVisible();

      await expect(
        page.getByTestId("send-file-candidate-tile-uncompleted"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-ready"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-candidate-tile-sent"),
      ).toBeVisible();

      const swornStatementSection = page.getByTestId("sworn-statement-section");
      await expect(swornStatementSection.getByRole("button")).toBeEnabled();

      await expect(
        page.getByTestId("candidate-decision-comment-section"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("send-file-certification-authority-tile-ready"),
      ).toBeVisible();
    });
  });
});
