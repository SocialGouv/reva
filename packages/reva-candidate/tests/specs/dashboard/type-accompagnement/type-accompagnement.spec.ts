import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";
import {
  navigateToTypeAccompagnement,
  typeAccompagnementHandlers,
} from "@tests/helpers/handlers/type-accompagnement/type-accompagnement.handler";
import { waitGraphQL } from "@tests/helpers/network/requests";

import type { Page } from "@playwright/test";
import type { MswFixture } from "next/experimental/testmode/playwright/msw";

const candidate = createCandidateEntity();

test("should show the dashboard autonome when typeAccompagnement is AUTONOME", async ({
  page,
  msw,
}) => {
  const candidacy = createCandidacyEntity({
    candidate,
    typeAccompagnement: "AUTONOME",
    status: "PROJET",
    certification: null,
  });
  const { handlers, dashboardWait } = dashboardHandlers({ candidacy });

  msw.use(...handlers);
  await login(page);
  await dashboardWait(page);

  await expect(
    page.locator('[data-testid="dashboard-autonome"]'),
  ).toBeVisible();
});

test("should show enabled type-accompagnement tile when no certification is selected", async ({
  page,
  msw,
}) => {
  const candidacy = createCandidacyEntity({
    candidate,
    typeAccompagnement: "AUTONOME",
    status: "PROJET",
    certification: null,
  });
  const { handlers, dashboardWait } = dashboardHandlers({ candidacy });

  msw.use(...handlers);
  await login(page);
  await dashboardWait(page);

  const tile = page.locator('[data-testid="type-accompagnement-tile"]');
  await expect(tile).toBeVisible();
  await expect(tile).not.toBeDisabled();
});

test("should navigate to type-accompagnement page when clicking tile", async ({
  page,
  msw,
}) => {
  const certification = createCertificationEntity({ isAapAvailable: true });
  const candidacy = createCandidacyEntity({
    candidate,
    typeAccompagnement: "AUTONOME",
    status: "PROJET",
    certification,
  });
  const { handlers, dashboardWait } = dashboardHandlers({ candidacy });

  msw.use(...handlers);
  await login(page);
  await dashboardWait(page);

  await page.locator('[data-testid="type-accompagnement-tile"]').click();

  await expect(page).toHaveURL(
    `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/type-accompagnement/`,
  );
});

test.describe("type-accompagnement page", () => {
  async function setupAndNavigate(page: Page, msw: MswFixture) {
    const certification = createCertificationEntity({ isAapAvailable: true });
    const candidacy = createCandidacyEntity({
      candidate,
      typeAccompagnement: "AUTONOME",
      status: "PROJET",
      certification,
    });
    const { handlers } = typeAccompagnementHandlers(candidacy);

    msw.use(...handlers);
    await login(page);
    await navigateToTypeAccompagnement(page, candidate.id, candidacy.id);

    return { candidacy };
  }

  test("should allow changing type-accompagnement and submit", async ({
    page,
    msw,
  }) => {
    const { candidacy } = await setupAndNavigate(page, msw);

    await expect(
      page.getByRole("heading", { name: "Modalités de parcours" }),
    ).toBeVisible();

    const autonomeRadio = page.locator(
      ".type-accompagnement-autonome-radio-button",
    );
    const accompagneRadio = page.locator(
      ".type-accompagnement-accompagne-radio-button",
    );

    await expect(autonomeRadio).toBeChecked();

    await page
      .locator(".type-accompagnement-accompagne-radio-button ~ label")
      .click();

    await expect(accompagneRadio).toBeChecked();

    await page
      .locator('[data-testid="submit-type-accompagnement-form-button"]')
      .click();

    const mutationPromise = waitGraphQL(
      page,
      "updateTypeAccompagnementForTypeAccompagnementPage",
    );

    await page
      .locator('[data-testid="submit-type-accompagnement-modal-button"]')
      .click();

    await mutationPromise;

    await expect(page).toHaveURL(
      `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );
  });
});
