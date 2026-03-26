import { expect, Page, test } from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import { createCandidacyDropOutEntity } from "@tests/helpers/entities/create-candidacy-dropout.entity";
import {
  type CandidacyEntity,
  createCandidacyEntity,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { loginAndWaitForCandidaciesInitialLoad } from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";
import { candidacyDropOutHandlers } from "@tests/helpers/handlers/candidacy-dropout.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import type { MswFixture } from "next/experimental/testmode/playwright/msw";

const candidate = createCandidateEntity();
const candidacy = createCandidacyEntity({
  candidate,
  candidacyDropOut: createCandidacyDropOutEntity({
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  }),
});

const decisionPageUrl = `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/candidacy-dropout-decision`;

const fvae = graphql.link("https://reva-api/api/graphql");

function postMutationHandlers(postMutationCandidacy: CandidacyEntity) {
  return [
    fvae.query(
      "getCandidacyByIdWithCandidateForDropOutDecision",
      graphQLResolver({ getCandidacyById: postMutationCandidacy }),
    ),
    fvae.query(
      "getCandidacyByIdForCandidacyGuard",
      graphQLResolver({ getCandidacyById: postMutationCandidacy }),
    ),
    fvae.query(
      "getCandidacyByIdWithCandidate",
      graphQLResolver({ getCandidacyById: postMutationCandidacy }),
    ),
    fvae.query(
      "getCandidacyByIdForDashboard",
      graphQLResolver({ getCandidacyById: postMutationCandidacy }),
    ),
    fvae.query(
      "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      graphQLResolver({
        candidate_getCandidateById: {
          candidacies: [postMutationCandidacy],
        },
      }),
    ),
  ];
}

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

    if (!candidacy.candidacyDropOut) {
      throw new Error("Expected a dropout");
    }

    const dropOutConfirmedCandidacy = {
      ...candidacy,
      candidacyDropOut: {
        ...candidacy.candidacyDropOut,
        dropOutConfirmedByCandidate: true,
      },
    };
    msw.use(...postMutationHandlers(dropOutConfirmedCandidacy));

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
    msw.use(...postMutationHandlers(cancelledCandidacy));

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
