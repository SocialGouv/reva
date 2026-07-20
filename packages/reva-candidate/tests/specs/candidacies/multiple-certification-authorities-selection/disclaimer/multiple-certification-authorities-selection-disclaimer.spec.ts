import { expect, test } from "next/experimental/testmode/playwright/msw";

import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import {
  createCandidaciesGuardsHandlers,
  createCandidacyGuardsAndDashboardHandlers,
  loginAndWaitForCandidaciesInitialLoad,
} from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";

const candidate = createCandidateEntity();

const candidacy = createCandidacyEntity({ candidate });

const PAGE_URL = `candidates/${candidate.id}/candidacies/${candidacy.id}/multiple-certification-authorities-selection/disclaimer/`;

function createDisclaimerHandlers() {
  return [
    ...createCandidaciesGuardsHandlers({
      candidate,
      candidacies: [candidacy],
    }),
    ...createCandidacyGuardsAndDashboardHandlers(candidacy),
  ];
}

test.describe("multiple certification authorities disclaimer page", () => {
  test.use({
    mswHandlers: [createDisclaimerHandlers(), { scope: "test" }],
  });

  test("shows the page title, chapo and details", async ({ page }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(PAGE_URL);

    await expect(
      page.getByRole("heading", { name: "Certificateur", level: 1 }),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Le certificateur étudiera les dossiers de faisabilité et de validation de cette candidature.",
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Plusieurs certificateurs sont disponibles pour la certification sélectionnée et votre localisation. Vous devez sélectionner le certificateur le plus adapté.",
      ),
    ).toBeVisible();
  });

  test("links to the certification authorities list", async ({ page }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(PAGE_URL);

    await expect(
      page.getByRole("link", { name: "Liste des certificateurs" }),
    ).toHaveAttribute(
      "href",
      `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/multiple-certification-authorities-selection/certification-authorities-list/`,
    );
  });

  test("links back to the candidacy page", async ({ page }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(PAGE_URL);

    await expect(page.getByRole("link", { name: "Retour" })).toHaveAttribute(
      "href",
      `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );
  });
});
