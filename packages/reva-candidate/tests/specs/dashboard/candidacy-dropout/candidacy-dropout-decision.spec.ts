import { expect, Page, test } from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { loginAndWaitForCandidaciesInitialLoad } from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";
import { candidacyDropOutHandlers } from "@tests/helpers/handlers/candidacy-dropout.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import type { MswFixture } from "next/experimental/testmode/playwright/msw";

const candidate = createCandidateEntity();
const candidacy = createCandidacyEntity({
  candidate,
  candidacyDropOut: {
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    dropOutConfirmedByCandidate: false,
    proofReceivedByAdmin: false,
    dropOutReason: {
      id: "reason-1",
      label: "Motif d'abandon",
      isActive: true,
    },
    status: "PROJET",
  },
});

const decisionPageUrl = `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/candidacy-dropout-decision`;

const fvae = graphql.link("https://reva-api/api/graphql");

async function setupAndNavigateToDropoutDecision(page: Page, msw: MswFixture) {
  msw.use(...candidacyDropOutHandlers({ candidacy }));
  await loginAndWaitForCandidaciesInitialLoad(page);

  const decisionPageQueryPromise = waitGraphQL(
    page,
    "getCandidacyByIdWithCandidateForDropOutDecision",
  );

  await page.goto(`${decisionPageUrl}/`);
  await decisionPageQueryPromise;
}

test.describe("Candidacy dropout decision page", () => {
  test("should let me access the page", async ({ page, msw }) => {
    await setupAndNavigateToDropoutDecision(page, msw);

    await expect(
      page.getByTestId("candidacy-dropout-decision-page"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Abandon d’une candidature VAE",
      }),
    ).toBeVisible();
  });

  test("should let me validate my drop out and lead me to the confirmation page", async ({
    page,
    msw,
  }) => {
    await setupAndNavigateToDropoutDecision(page, msw);

    await page
      .getByRole("radio", {
        name: /Non, je souhaite arrêter ce parcours VAE/,
      })
      .check({ force: true });

    const mutationPromise = waitGraphQL(
      page,
      "updateCandidateCandidacyDropoutDecision",
    );

    await page.getByRole("button", { name: /Enregistrer/ }).click();
    await mutationPromise;

    await expect(page).toHaveURL(`${decisionPageUrl}/dropout-confirmation/`);
  });

  test("should let me cancel my drop out and redirect me to the homepage", async ({
    page,
    msw,
  }) => {
    await setupAndNavigateToDropoutDecision(page, msw);

    await page
      .getByRole("radio", {
        name: /Oui, je continue ce parcours VAE/,
      })
      .check({ force: true });

    const cancelledCandidacy = { ...candidacy, candidacyDropOut: null };
    msw.use(
      fvae.query(
        "getCandidacyByIdWithCandidateForDropOutDecision",
        graphQLResolver({ getCandidacyById: cancelledCandidacy }),
      ),
      fvae.query(
        "getCandidacyByIdForCandidacyGuard",
        graphQLResolver({ getCandidacyById: cancelledCandidacy }),
      ),
      fvae.query(
        "getCandidacyByIdWithCandidate",
        graphQLResolver({ getCandidacyById: cancelledCandidacy }),
      ),
      fvae.query(
        "getCandidacyByIdForDashboard",
        graphQLResolver({ getCandidacyById: cancelledCandidacy }),
      ),
    );

    const mutationPromise = waitGraphQL(
      page,
      "updateCandidateCandidacyDropoutDecision",
    );

    await page.getByRole("button", { name: /Enregistrer/ }).click();
    await mutationPromise;

    await expect(page).toHaveURL(
      `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );
  });
});
