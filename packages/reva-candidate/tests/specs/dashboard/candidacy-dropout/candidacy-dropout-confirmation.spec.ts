import { Page } from "@playwright/test";
import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";

import type { MswFixture } from "next/experimental/testmode/playwright/msw";

const candidate = createCandidateEntity();
const candidacy = createCandidacyEntity({
  candidate,
  candidacyDropOut: {
    createdAt: 1580428800000,
    dropOutConfirmedByCandidate: false,
    proofReceivedByAdmin: false,
    dropOutReason: {
      id: "reason-1",
      label: "Motif d'abandon",
      isActive: true,
    },
    status: "PROJET",
  },
});

const setupAndNavigateToDropoutConfirmation = async (
  page: Page,
  msw: MswFixture,
) => {
  const { handlers, dashboardWait } = dashboardHandlers({ candidacy });
  msw.use(...handlers);
  await login(page);
  await dashboardWait(page);
  await page.goto(
    `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/candidacy-dropout-decision/dropout-confirmation`,
  );
};

test.describe("Candidacy dropout confirmation page", () => {
  test("should display the page with correct title", async ({ page, msw }) => {
    await setupAndNavigateToDropoutConfirmation(page, msw);

    await expect(
      page.locator('[data-testid="candidacy-dropout-confirmation-page"]'),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Votre parcours VAE est abandonné" }),
    ).toBeVisible();
  });

  test("should redirect to homepage when clicking back button", async ({
    page,
    msw,
  }) => {
    await setupAndNavigateToDropoutConfirmation(page, msw);

    await page
      .locator('[data-testid="candidacy-dropout-confirmation-back-button"]')
      .click();

    await expect(page).toHaveURL(
      `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );
  });
});
