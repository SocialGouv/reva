import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";

import {
  Candidate,
  Certification,
  Organism,
} from "@/graphql/generated/graphql";

test.describe("Authenticated on dashboard", () => {
  const organism = createOrganismEntity();
  const certification = createCertificationEntity();

  const candidate = createCandidateEntity();

  const candidacy = createCandidacyEntity({
    candidate: candidate as Candidate,
    organism: organism as Organism,
    certification: certification as Certification,
  });

  const { handlers, dashboardWait } = dashboardHandlers({
    candidacy,
    activeFeaturesForConnectedUser: [],
  });
  test.use({
    mswHandlers: [handlers, { scope: "test" }],
  });

  test("shows candidate name", async ({ page }) => {
    await login(page);
    await dashboardWait(page);

    await expect(
      page.locator('[data-test="candidate-dashboard"]'),
    ).toBeVisible();

    await expect(
      page.locator('[data-test="project-home-fullname"]'),
    ).toHaveText("John Doe");
  });

  test("shows logout button", async ({ page }) => {
    await login(page);

    await expect(
      page.getByRole("button", { name: "Se déconnecter" }),
    ).toBeVisible();
  });
});
