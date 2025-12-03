import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";

import type { CandidacyStatusStep } from "@/graphql/generated/graphql";

const statuses: CandidacyStatusStep[] = ["VALIDATION", "PRISE_EN_CHARGE"];

for (const status of statuses) {
  test.describe(`Tuile envoi de candidature active au statut ${status}`, () => {
    const organism = createOrganismEntity();
    const certification = createCertificationEntity();
    const candidate = createCandidateEntity();

    const candidacy = createCandidacyEntity({
      candidate,
      organism,
      certification,
      status,
    });

    const { handlers, dashboardWait } = dashboardHandlers({
      candidacy,
      activeFeaturesForConnectedUser: [],
    });

    test.use({
      mswHandlers: [handlers, { scope: "test" }],
    });

    test("bouton cliquable", async ({ page }) => {
      await login(page);
      await dashboardWait(page);

      await expect(
        page.getByTestId("submit-candidacy-tile").getByRole("button"),
      ).toBeEnabled();
    });
  });
}
