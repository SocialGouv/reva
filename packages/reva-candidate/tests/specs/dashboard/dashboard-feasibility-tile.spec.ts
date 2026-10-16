import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  createCandidacyEntity,
  type CreateCandidacyEntityOptions,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createFeasibilityEntity } from "@tests/helpers/entities/create-feasibility.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";

import type { MswFixture } from "next/experimental/testmode/playwright/msw";
import type { Page } from "playwright";

const candidate = createCandidateEntity();

const setupDashboard = async (
  page: Page,
  msw: MswFixture,
  candidacyOptions: CreateCandidacyEntityOptions = {},
) => {
  const candidacy = createCandidacyEntity({
    candidate,
    typeAccompagnement: "ACCOMPAGNE",
    ...candidacyOptions,
  });
  const { handlers, dashboardWait } = dashboardHandlers({ candidacy });
  msw.use(...handlers);

  await login(page);
  await dashboardWait(page);
};

test("should display feasibility-badge-admissible when feasibility is admisible", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "ADMISSIBLE",
      feasibilityFormat: "DEMATERIALIZED",
    }),
    typeAccompagnement: "AUTONOME",
    readyForJuryEstimatedAt: null,
  });

  await expect(page.getByTestId("feasibility-badge-admissible")).toBeVisible();
});

test("should display 'to validate' feasibility badge when sent to candidate and not validated yet", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "DRAFT",
      feasibilityFormat: "DEMATERIALIZED",
      dematerializedFeasibilityFile: {
        sentToCandidateAt: Date.now(),
      },
    }),
    typeAccompagnement: "ACCOMPAGNE",
  });

  await expect(page.getByTestId("feasibility-badge-to-validate")).toBeVisible();
});

test("should not display a badge when the dematerialized DF is not ready to be sent to the certification authority", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "DRAFT",
      feasibilityFormat: "DEMATERIALIZED",
      dematerializedFeasibilityFile: {
        sentToCandidateAt: Date.now(),
        candidateConfirmationAt: Date.now(),
        isReadyToBeSentToCertificationAuthority: false,
      },
    }),
    typeAccompagnement: "ACCOMPAGNE",
  });

  await expect(page.getByTestId("feasibility-badge-to-send")).not.toBeVisible();
  await expect(
    page.getByTestId("feasibility-badge-to-validate"),
  ).not.toBeVisible();
});

test("should display feasibility-badge-to-send for accompanied candidacy when the dematerialized DF is ready to be sent to the certification authority", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "DRAFT",
      feasibilityFormat: "DEMATERIALIZED",
      dematerializedFeasibilityFile: {
        sentToCandidateAt: Date.now(),
        candidateConfirmationAt: Date.now(),
        swornStatementFileId: "1",
        isReadyToBeSentToCertificationAuthority: true,
      },
    }),
    typeAccompagnement: "ACCOMPAGNE",
  });

  await expect(page.getByTestId("feasibility-badge-to-send")).toBeVisible();
  await expect(page.getByTestId("feasibility-badge-to-send")).toHaveText(
    "à envoyer au certificateur",
  );
});

test("should display feasibility-badge-to-send for autonomous candidacy when the dematerialized DF is draft, even if it is not ready to be sent", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "DRAFT",
      feasibilityFormat: "DEMATERIALIZED",
      dematerializedFeasibilityFile: {
        isReadyToBeSentToCertificationAuthority: false,
      },
    }),
    feasibilityFormat: "DEMATERIALIZED",
    typeAccompagnement: "AUTONOME",
  });

  await expect(page.getByTestId("feasibility-badge-to-send")).toBeVisible();
  await expect(page.getByTestId("feasibility-badge-to-send")).toHaveText(
    "à envoyer au certificateur",
  );
});

test("should keep the to-validate badge for autonomous candidacy when the dematerialized DF was sent and not confirmed yet", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "DRAFT",
      feasibilityFormat: "DEMATERIALIZED",
      dematerializedFeasibilityFile: {
        sentToCandidateAt: Date.now(),
        isReadyToBeSentToCertificationAuthority: false,
      },
    }),
    feasibilityFormat: "DEMATERIALIZED",
    typeAccompagnement: "AUTONOME",
  });

  await expect(page.getByTestId("feasibility-badge-to-validate")).toBeVisible();
  await expect(page.getByTestId("feasibility-badge-to-send")).not.toBeVisible();
});

test("should display feasibility-badge-to-send for autonomous candidacy when the PDF DF decision is draft", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "DRAFT",
      feasibilityFormat: "UPLOADED_PDF",
    }),
    feasibilityFormat: "UPLOADED_PDF",
    typeAccompagnement: "AUTONOME",
  });

  await expect(page.getByTestId("feasibility-badge-to-send")).toBeVisible();
  await expect(page.getByTestId("feasibility-badge-to-send")).toHaveText(
    "à envoyer au certificateur",
  );
});

test("should display feasibility-badge-pending for candidacy when DF decision is PENDING", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "PENDING",
      feasibilityFileSentAt: Date.now(),
      feasibilityFormat: "DEMATERIALIZED",
      dematerializedFeasibilityFile: {
        sentToCandidateAt: Date.now(),
        candidateConfirmationAt: Date.now(),
        swornStatementFileId: "1",
      },
    }),
  });

  await expect(page.getByTestId("feasibility-badge-pending")).toBeVisible();
  await expect(page.getByTestId("feasibility-badge-pending")).toHaveText(
    "envoyé au certificateur",
  );
});

test("should display feasibility-badge-pending for candidacy when DF decision is COMPLETE", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "COMPLETE",
      feasibilityFileSentAt: Date.now(),
      dematerializedFeasibilityFile: {
        sentToCandidateAt: Date.now(),
        candidateConfirmationAt: Date.now(),
        swornStatementFileId: "1",
      },
    }),
  });

  await expect(page.getByTestId("feasibility-badge-pending")).toBeVisible();
  await expect(page.getByTestId("feasibility-badge-pending")).toHaveText(
    "envoyé au certificateur",
  );
});

test("should display feasibility-badge-rejected for candidacy when DF decision is REJECTED", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "REJECTED",
      feasibilityFileSentAt: Date.now(),
      dematerializedFeasibilityFile: {
        sentToCandidateAt: Date.now(),
        candidateConfirmationAt: Date.now(),
        swornStatementFileId: "1",
      },
    }),
  });

  await expect(page.getByTestId("feasibility-badge-rejected")).toBeVisible();
  await expect(page.getByTestId("feasibility-badge-rejected")).toHaveText(
    "non recevable",
  );
});

test("should be disabled when there is no feasibility", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    typeAccompagnement: "ACCOMPAGNE",
  });

  await expect(
    page.getByTestId("feasibility-tile").getByRole("button"),
  ).toBeDisabled();
});

test("should be enabled when PDF DF is incomplete (candidate can view the decision)", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "INCOMPLETE",
      feasibilityFileSentAt: "2024-01-01T00:00:00.000Z",
      feasibilityFormat: "UPLOADED_PDF",
    }),
    typeAccompagnement: "ACCOMPAGNE",
  });

  await expect(
    page.getByTestId("feasibility-tile").getByRole("button"),
  ).toBeEnabled();
});

test("ne doit afficher aucun label quand le DF est incomplet et pas encore renvoyé au candidat par l'AAP", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "INCOMPLETE",
      decisionSentAt: Date.parse("2024-01-02T00:00:00.000Z"),
      feasibilityFormat: "DEMATERIALIZED",
      dematerializedFeasibilityFile: {
        sentToCandidateAt: Date.parse("2024-01-01T00:00:00.000Z"),
        candidateConfirmationAt: Date.parse("2024-01-01T00:00:00.000Z"),
        isReadyToBeSentToCertificationAuthority: true,
      },
    }),
    typeAccompagnement: "ACCOMPAGNE",
  });

  await expect(
    page.getByTestId("feasibility-badge-to-validate"),
  ).not.toBeVisible();
  await expect(page.getByTestId("feasibility-badge-to-send")).not.toBeVisible();
});

test("should be disabled when DF is incomplete and has not been yet resent to candidate by AAP", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    feasibility: createFeasibilityEntity({
      decision: "INCOMPLETE",
      decisionSentAt: "2024-01-02T00:00:00.000Z",
      feasibilityFormat: "DEMATERIALIZED",
      dematerializedFeasibilityFile: {
        sentToCandidateAt: "2024-01-01T00:00:00.000Z",
        candidateConfirmationAt: "2024-01-01T00:00:00.000Z",
      },
    }),
    typeAccompagnement: "ACCOMPAGNE",
  });

  await expect(
    page.getByTestId("feasibility-tile").getByRole("button"),
  ).toBeDisabled();
});
