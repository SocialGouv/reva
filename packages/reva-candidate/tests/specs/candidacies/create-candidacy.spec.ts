import {
  expect,
  test,
  type Page,
} from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const candidate = createCandidateEntity();
const certification = createCertificationEntity({
  label: "Certification 1",
  codeRncp: "RNCP0001",
});

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
    fvae.query(
      "certifications",
      graphQLResolver({
        searchCertificationsForCandidate: {
          rows: [certification],
          info: {
            totalRows: 1,
            currentPage: 1,
            totalPages: 1,
            pageLength: 10,
          },
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

test.describe("create candidacy from candidacies page", () => {
  test.use({
    mswHandlers: [createCandidaciesHandlers(), { scope: "test" }],
  });

  test("create default candidacy", async ({ page }) => {
    await loginAndWaitForInitialLoad(page);

    await page.goto(`candidates/${candidate.id}/candidacies/`);

    await expect(
      page.getByText(
        "Valorisez votre expérience professionnelle en commençant une candidature dès maintenant.",
      ),
    ).toBeVisible();

    const createCandidacyButton = page.getByRole("button", {
      name: "Commencer une VAE",
    });
    createCandidacyButton.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/create/`,
    );

    await expect(
      page.getByRole("heading", { name: "Commencer une VAE" }),
    ).toBeVisible();

    const maDemarcheEstPersonnelleCard = page.getByText(
      "Ma démarche est personnelle",
    );
    await expect(maDemarcheEstPersonnelleCard).toBeVisible();
    maDemarcheEstPersonnelleCard.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/create/certifications/`,
    );

    await waitGraphQL(page, "certifications");

    const certificationCard = page.getByText(certification.label);
    await expect(certificationCard).toBeVisible();
    certificationCard.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/create/certifications/${certification.id}/`,
    );
  });
});
