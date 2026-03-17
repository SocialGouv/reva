import { expect, test } from "next/experimental/testmode/playwright/msw";

import {
  CandidacyEntity,
  createCandidacyEntity,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import {
  createCandidaciesGuardsHandlers,
  loginAndWaitForCandidaciesInitialLoad,
} from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";

const candidate = createCandidateEntity();

function createCandidaciesHandlers(args?: { candidacies?: CandidacyEntity[] }) {
  return [
    ...createCandidaciesGuardsHandlers({
      candidate,
      candidacies: args?.candidacies,
    }),
  ];
}

test.describe("select candidacy from candidacies page", () => {
  const certification = createCertificationEntity({
    label: "Certification 1",
    codeRncp: "RNCP0001",
  });
  const candidacy = createCandidacyEntity({
    candidate,
    certification,
    status: "PROJET",
  });

  test.use({
    mswHandlers: [
      createCandidaciesHandlers({ candidacies: [candidacy] }),
      { scope: "test" },
    ],
  });

  test("when i access the page it shows one candidacy card, click on it and redirects to the candidacy page", async ({
    page,
  }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);

    await page.goto(`candidates/${candidate.id}/candidacies/`);

    const candidacyCard = page.getByText(
      `RNCP ${certification.codeRncp} : ${certification.label}`,
    );
    await expect(candidacyCard).toBeVisible();
    await candidacyCard.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );
  });
});
