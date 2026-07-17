import { expect, Page, test } from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import {
  loginAndWaitForInitialLoad,
  getDefaultFeasibilityHandlers,
} from "@tests/helpers/handlers/feasibility/dematerialized-feasibility-file/dematerialized-feasibility-file.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import {
  DF_FORMATED_DATE_6_MONTHS_AGO,
  DF_FORMATED_DATE_6_MONTHS_FROM_NOW,
} from "./dff-mocks";

const CANDIDACY_ID = "57bf364b-8c8b-4ff4-889b-66917e26d7d0";

const candidate = createCandidateEntity();

const fvae = graphql.link("https://reva-api/api/graphql");

function createEligibilityHandlers() {
  const candidacy = createCandidacyEntity({
    id: CANDIDACY_ID,
    candidate,
    certification: {
      label:
        "Titre à finalité professionnelle Assistant de vie dépendance (ADVD)",
      codeRncp: "37780",
    },
    status: "PROJET",
    experiencesCount: 2,
    typeAccompagnement: "AUTONOME",
  });

  return [
    ...getDefaultFeasibilityHandlers(candidacy),
    fvae.query(
      "getCandidacyByIdForFeasibilityDematAutonomeEligibilityPage",
      graphQLResolver({
        getCandidacyById: candidacy,
      }),
    ),
    fvae.mutation(
      "createOrUpdateEligibilityRequirement",
      graphQLResolver({
        dematerialized_feasibility_file_createOrUpdateEligibilityRequirement: {
          id: CANDIDACY_ID,
        },
      }),
    ),
  ];
}

async function visitEligibilityPage(page: Page) {
  await loginAndWaitForInitialLoad(page);

  await page.goto(
    `candidates/${candidate.id}/candidacies/${CANDIDACY_ID}/feasibility-demat-autonome/eligibility`,
  );
  await waitGraphQL(
    page,
    "getCandidacyByIdForFeasibilityDematAutonomeEligibilityPage",
  );
}

test.describe("Dematerialized Feasibility File Eligibility Page", () => {
  test.describe("Initial form state", () => {
    test.use({
      mswHandlers: [createEligibilityHandlers(), { scope: "test" }],
    });

    test("should have disabled form buttons by default", async ({ page }) => {
      await visitEligibilityPage(page);

      await expect(
        page.getByRole("button", { name: "Enregistrer" }),
      ).toBeDisabled();
    });
  });

  test.describe("First-time eligibility request", () => {
    test.use({
      mswHandlers: [createEligibilityHandlers(), { scope: "test" }],
    });

    test("should disable date and time fields when PREMIERE_DEMANDE_RECEVABILITE eligibility is selected", async ({
      page,
    }) => {
      await visitEligibilityPage(page);

      await expect(
        page.getByRole("button", { name: "Enregistrer" }),
      ).toBeDisabled();

      const eligibilitySelect = page.getByTestId("eligibility-select");
      await eligibilitySelect
        .locator("select")
        .selectOption("PREMIERE_DEMANDE_RECEVABILITE");

      const validUntilInput = page.getByTestId("eligibility-valid-until-input");
      await expect(validUntilInput).not.toBeVisible();

      await expect(
        page.getByRole("button", { name: "Enregistrer" }),
      ).toBeEnabled();
    });
  });

  test.describe("Existing candidate eligibility", () => {
    test.describe("DETENTEUR_RECEVABILITE eligibility", () => {
      test.use({
        mswHandlers: [createEligibilityHandlers(), { scope: "test" }],
      });

      test("should handle DETENTEUR_RECEVABILITE eligibility with future date validation", async ({
        page,
      }) => {
        await visitEligibilityPage(page);

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeDisabled();

        const eligibilitySelect = page.getByTestId("eligibility-select");
        await eligibilitySelect
          .locator("select")
          .selectOption("DETENTEUR_RECEVABILITE");

        const validUntilInput = page.getByTestId(
          "eligibility-valid-until-input",
        );
        await expect(validUntilInput).toBeVisible();
        const dateInput = validUntilInput.getByRole("textbox");
        await expect(dateInput).toBeEnabled();
        await dateInput.clear();
        await dateInput.fill(DF_FORMATED_DATE_6_MONTHS_FROM_NOW);

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeEnabled();
      });

      test("should show error message when submitting DETENTEUR_RECEVABILITE eligibility with past date", async ({
        page,
      }) => {
        await visitEligibilityPage(page);

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeDisabled();

        const eligibilitySelect = page.getByTestId("eligibility-select");
        await eligibilitySelect
          .locator("select")
          .selectOption("DETENTEUR_RECEVABILITE");

        const validUntilInput = page.getByTestId(
          "eligibility-valid-until-input",
        );
        await expect(validUntilInput).toBeVisible();
        const dateInput = validUntilInput.getByRole("textbox");
        await expect(dateInput).toBeEnabled();
        await dateInput.clear();
        await dateInput.fill(DF_FORMATED_DATE_6_MONTHS_AGO);

        await expect(
          validUntilInput.locator('[class*="fr-error-text"]'),
        ).not.toBeVisible();

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeEnabled();

        await page.getByRole("button", { name: "Enregistrer" }).click();

        await expect(
          validUntilInput.locator('[class*="fr-error-text"]'),
        ).toBeVisible();
      });
    });

    test.describe("DETENTEUR_RECEVABILITE", () => {
      test.use({
        mswHandlers: [createEligibilityHandlers(), { scope: "test" }],
      });

      test("should handle DETENTEUR_RECEVABILITE eligibility with future date validation", async ({
        page,
      }) => {
        await visitEligibilityPage(page);

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeDisabled();

        const eligibilitySelect = page.getByTestId("eligibility-select");
        await eligibilitySelect
          .locator("select")
          .selectOption("DETENTEUR_RECEVABILITE");

        const validUntilInput = page.getByTestId(
          "eligibility-valid-until-input",
        );
        await expect(validUntilInput).toBeVisible();
        const dateInput = validUntilInput.getByRole("textbox");
        await expect(dateInput).toBeEnabled();
        await dateInput.clear();
        await dateInput.fill(DF_FORMATED_DATE_6_MONTHS_FROM_NOW);

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeEnabled();
      });
    });
  });
});
