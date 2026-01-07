import {
  expect,
  test,
  type Page,
} from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  CandidacyEntity,
  createCandidacyEntity,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const candidate = createCandidateEntity();

function createCandidaciesHandlers(args?: { candidacies?: CandidacyEntity[] }) {
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
    fvae.query(
      "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      graphQLResolver({
        candidate_getCandidateById: {
          candidacies: args?.candidacies ?? [],
        },
      }),
    ),
    fvae.mutation(
      "candidate_loginWithToken",
      graphQLResolver({ candidate_loginWithToken: null }),
    ),
    fvae.query(
      "activeFeaturesForConnectedUser",
      graphQLResolver({ activeFeaturesForConnectedUser: ["MULTI_CANDIDACY"] }),
    ),
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

test.describe("candidacies page with no candidacies", () => {
  test.use({
    mswHandlers: [createCandidaciesHandlers(), { scope: "test" }],
  });

  test("when i access the page it shows the correct title and empty state when there are no candidacies", async ({
    page,
  }) => {
    await loginAndWaitForInitialLoad(page);

    await page.goto(`candidates/${candidate.id}/candidacies/`);

    await expect(
      page.getByText(
        "Valorisez votre expérience professionnelle en commençant une candidature dès maintenant.",
      ),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Commencer une VAE",
      }),
    ).toBeVisible();
  });
});

test.describe("candidacies page with candidacies", () => {
  const certification1 = createCertificationEntity({
    label: "Certification 1",
    codeRncp: "RNCP0001",
  });
  const candidacy1 = createCandidacyEntity({
    candidate,
    certification: certification1,
    status: "PROJET",
  });

  const certification2 = createCertificationEntity({
    label: "Certification 2",
    codeRncp: "RNCP0002",
  });
  const candidacy2 = createCandidacyEntity({
    candidate,
    certification: certification2,
    status: "PROJET",
  });

  test.use({
    mswHandlers: [
      createCandidaciesHandlers({ candidacies: [candidacy1, candidacy2] }),
      { scope: "test" },
    ],
  });

  test("when i access the page it shows one candidacy card with the correct certification label", async ({
    page,
  }) => {
    await loginAndWaitForInitialLoad(page);

    await page.goto(`candidates/${candidate.id}/candidacies/`);

    await expect(
      page.getByText(
        "Voici la liste de vos candidatures France VAE. Sélectionnez celle de votre choix pour suivre son évolution et accomplir les prochaines étapes de votre parcours.",
      ),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Créer une candidature",
      }),
    ).toBeVisible();

    await expect(
      page.getByText(
        `RNCP ${certification1.codeRncp} : ${certification1.label}`,
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        `RNCP ${certification2.codeRncp} : ${certification2.label}`,
      ),
    ).toBeVisible();
  });
});
