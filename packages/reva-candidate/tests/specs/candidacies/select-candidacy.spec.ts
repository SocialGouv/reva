import {
  expect,
  test,
  type Page,
} from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  CandidacyEntity,
  createCandidacyEntity,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createCandidaciesGuardsHandlers } from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";
import { waitGraphQL } from "@tests/helpers/network/requests";

const candidate = createCandidateEntity();

function createCandidaciesHandlers(args?: { candidacies?: CandidacyEntity[] }) {
  return [
    ...createCandidaciesGuardsHandlers({
      candidate,
      candidacies: args?.candidacies ?? [],
    }),
  ];
}

async function loginAndWaitForInitialLoad(page: Page) {
  await login(page);
  await Promise.all([
    waitGraphQL(page, "candidate_getCandidateForCandidatesGuard"),
    waitGraphQL(page, "getCandidateByIdForCandidateGuard"),
    waitGraphQL(
      page,
      "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
    ),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
  ]);
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
    await loginAndWaitForInitialLoad(page);

    await page.goto(`candidates/${candidate.id}/candidacies/`);

    const candidacyCard = page.getByText(
      `RNCP ${certification.codeRncp} : ${certification.label}`,
    );
    await expect(candidacyCard).toBeVisible();
    candidacyCard.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );
  });
});
