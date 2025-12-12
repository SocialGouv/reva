import {
  expect,
  test,
  type Page,
} from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const candidate = createCandidateEntity();

function createFirstConnexionHandlers() {
  return [
    fvae.query(
      "candidate_getCandidateForCandidatesGuard",
      graphQLResolver({
        candidate_getCandidateWithCandidacy: {
          ...candidate,
        },
      }),
    ),
    fvae.query(
      "getCandidateByIdForCandidateGuard",
      graphQLResolver({
        candidate_getCandidateById: {
          ...candidate,
        },
      }),
    ),
    fvae.mutation(
      "candidate_loginWithToken",
      graphQLResolver({ candidate_loginWithToken: null }),
    ),
    fvae.query(
      "activeFeaturesForConnectedUser",
      graphQLResolver({ activeFeaturesForConnectedUser: [] }),
    ),
  ];
}

test.use({
  mswHandlers: [createFirstConnexionHandlers(), { scope: "test" }],
});

async function loginAndWaitForInitialLoad(page: Page) {
  await login(page);
  await Promise.all([
    waitGraphQL(page, "candidate_getCandidateForCandidatesGuard"),
    waitGraphQL(page, "getCandidateByIdForCandidateGuard"),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
  ]);
}

test("when i access the page it show the correct title", async ({ page }) => {
  await loginAndWaitForInitialLoad(page);

  await page.goto(`candidates/${candidate.id}/first-connexion`);

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Bienvenue dans votre espace France VAE",
    }),
  ).toBeVisible();
});

test("when i click on the 'Mon profil' button it redirect me to the profile page", async ({
  page,
}) => {
  await loginAndWaitForInitialLoad(page);

  await page.goto(`candidates/${candidate.id}/first-connexion`);

  await page.getByRole("link", { name: "Mon profil" }).click();

  await expect(page).toHaveURL(
    `candidates/${candidate.id}/profile/?navigationDisabled=true`,
  );
});
