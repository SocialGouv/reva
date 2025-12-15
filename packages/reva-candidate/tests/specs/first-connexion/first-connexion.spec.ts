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

function createFirstConnexionHandlers(args?: {
  profileInformationCompleted?: boolean;
}) {
  return [
    fvae.query(
      "candidate_getCandidateForCandidatesGuard",
      graphQLResolver({
        candidate_getCandidateWithCandidacy: {
          ...candidate,
          profileInformationCompleted:
            args?.profileInformationCompleted ?? true,
        },
      }),
    ),
    fvae.query(
      "getCandidateByIdForCandidateGuard",
      graphQLResolver({
        candidate_getCandidateById: {
          ...candidate,
          profileInformationCompleted:
            args?.profileInformationCompleted ?? true,
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

async function loginAndWaitForInitialLoad(page: Page) {
  await login(page);
  await Promise.all([
    waitGraphQL(page, "candidate_getCandidateForCandidatesGuard"),
    waitGraphQL(page, "getCandidateByIdForCandidateGuard"),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
  ]);
}

test.describe("page tests", () => {
  test.use({
    mswHandlers: [createFirstConnexionHandlers(), { scope: "test" }],
  });

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
});

test.describe("Login and redirect tests", () => {
  test("when i login and the profile information is  completed it redirect me to the candidacies page", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...createFirstConnexionHandlers({ profileInformationCompleted: true }),
    );
    await loginAndWaitForInitialLoad(page);

    await expect(page).toHaveURL(`candidates/${candidate.id}/candidacies/`);
  });

  test("when i login and the profile information is not completed it redirect me to the first connexion page", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...createFirstConnexionHandlers({ profileInformationCompleted: false }),
    );
    await loginAndWaitForInitialLoad(page);

    await expect(page).toHaveURL(`candidates/${candidate.id}/first-connexion/`);
  });
});
