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
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

const organism = createOrganismEntity();
const certification = createCertificationEntity();
const candidate = createCandidateEntity();

const fvae = graphql.link("https://reva-api/api/graphql");

async function loginAndWaitForInitialLoad(page: Page) {
  await login(page);
  await Promise.all([
    waitGraphQL(page, "candidate_getCandidateForCandidatesGuard"),
    waitGraphQL(page, "getCandidateByIdForCandidateGuard"),
    waitGraphQL(
      page,
      "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
    ),
    waitGraphQL(page, "getCandidacyByIdForCandidacyGuard"),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
  ]);
}

function createUpdateExperienceHandlers(candidacy: CandidacyEntity) {
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
          candidacies: [candidacy],
        },
      }),
    ),
    fvae.query(
      "getCandidacyByIdForCandidacyGuard",
      graphQLResolver({ getCandidacyById: candidacy }),
    ),
    fvae.query(
      "getCandidacyByIdForUpdateExperience",
      graphQLResolver({ getCandidacyById: candidacy }),
    ),
    fvae.mutation(
      "delete_experience",
      graphQLResolver({
        candidacy_deleteExperience: true,
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

test.describe("Candidacy in PROJET status", () => {
  const candidacy = createCandidacyEntity({
    candidate,
    organism,
    certification,
    status: "PROJET",
    experiencesCount: 2,
  });

  test.use({
    mswHandlers: [createUpdateExperienceHandlers(candidacy), { scope: "test" }],
  });

  test("shows delete button", async ({ page }) => {
    await loginAndWaitForInitialLoad(page);

    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/experiences/exp-1`,
    );
    await waitGraphQL(page, "getCandidacyByIdForUpdateExperience");

    await expect(
      page.getByRole("button", { name: "Supprimer cette expérience" }),
    ).toBeVisible();
  });

  test("opens confirmation modal when clicking delete button", async ({
    page,
  }) => {
    await loginAndWaitForInitialLoad(page);

    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/experiences/exp-1`,
    );
    await waitGraphQL(page, "getCandidacyByIdForUpdateExperience");

    const deleteButton = page.getByRole("button", {
      name: "Supprimer cette expérience",
    });
    await deleteButton.click();

    const modal = page.getByRole("dialog");

    await expect(
      modal.getByRole("heading", {
        name: "Voulez-vous supprimer cette expérience ?",
      }),
    ).toBeVisible();
  });

  test("closes modal when clicking Annuler", async ({ page }) => {
    await loginAndWaitForInitialLoad(page);

    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/experiences/exp-1`,
    );
    await waitGraphQL(page, "getCandidacyByIdForUpdateExperience");

    await page
      .getByRole("button", { name: "Supprimer cette expérience" })
      .click();

    await page.getByRole("button", { name: "Annuler" }).click();

    await expect(
      page.getByRole("heading", {
        name: "Voulez-vous supprimer cette expérience ?",
      }),
    ).not.toBeVisible();
  });

  test("deletes experience and redirects when confirming", async ({ page }) => {
    await loginAndWaitForInitialLoad(page);

    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/experiences/exp-1`,
    );
    await waitGraphQL(page, "getCandidacyByIdForUpdateExperience");

    const deleteButton = page.getByRole("button", {
      name: "Supprimer cette expérience",
    });
    await deleteButton.click();

    const modal = page.getByRole("dialog");
    await modal.waitFor({ state: "visible" });

    const confirmButton = modal.getByRole("button", {
      name: "Confirmer la suppression de l'expérience",
    });

    const deleteMutationPromise = waitGraphQL(page, "delete_experience");

    await confirmButton.click({ force: true });
    await deleteMutationPromise;

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/experiences/`,
    );
  });
});

test.describe("Candidacy in PARCOURS_CONFIRME status", () => {
  const candidacy = createCandidacyEntity({
    candidate,
    organism,
    certification,
    status: "PARCOURS_CONFIRME",
    experiencesCount: 2,
  });

  test.use({
    mswHandlers: [createUpdateExperienceHandlers(candidacy), { scope: "test" }],
  });

  test("hides delete button", async ({ page }) => {
    await loginAndWaitForInitialLoad(page);

    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/experiences/exp-1`,
    );
    await waitGraphQL(page, "getCandidacyByIdForUpdateExperience");

    await expect(
      page.getByRole("button", { name: "Supprimer cette expérience" }),
    ).not.toBeVisible();
  });
});
