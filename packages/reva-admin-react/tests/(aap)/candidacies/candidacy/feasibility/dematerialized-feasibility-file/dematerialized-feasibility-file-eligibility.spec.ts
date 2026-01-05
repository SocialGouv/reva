import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../../shared/helpers/network/requests";

import {
  DF_FORMATED_DATE_6_MONTHS_AGO,
  DF_FORMATED_DATE_6_MONTHS_FROM_NOW,
} from "./dff-mocks";

const CANDIDACY_ID = "57bf364b-8c8b-4ff4-889b-66917e26d7d0";
const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

function createEligibilityHandlers() {
  return [
    fvae.query(
      "getCandidacyByIdForAapFeasibilityEligibilityPage",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          certification: {
            label:
              "Titre à finalité professionnelle Assistant de vie dépendance (ADVD)",
            codeRncp: "37780",
          },
        },
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

async function waitForEligibilityQueries(page: Page) {
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(page, "getCandidacyByIdForAapFeasibilityEligibilityPage"),
  ]);
}

test.describe("Dematerialized Feasibility File Eligibility Page", () => {
  test.describe("Initial form state", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createEligibilityHandlers()],
        { scope: "test" },
      ],
    });

    test("should have disabled form buttons by default", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/eligibility`,
      );
      await waitForEligibilityQueries(page);

      await expect(
        page.getByRole("button", { name: "Enregistrer" }),
      ).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "Réinitialiser" }),
      ).toBeDisabled();
    });
  });

  test.describe("First-time eligibility request", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createEligibilityHandlers()],
        { scope: "test" },
      ],
    });

    test("should disable date and time fields when PREMIERE_DEMANDE_RECEVABILITE eligibility is selected", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/eligibility`,
      );
      await waitForEligibilityQueries(page);

      await expect(
        page.getByRole("button", { name: "Enregistrer" }),
      ).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "Réinitialiser" }),
      ).toBeDisabled();

      const eligibilitySelect = page.getByTestId("eligibility-select");
      await eligibilitySelect
        .locator("select")
        .selectOption("PREMIERE_DEMANDE_RECEVABILITE");

      const validUntilInput = page.getByTestId("eligibility-valid-until-input");
      await expect(validUntilInput).toBeVisible();
      await expect(validUntilInput.getByRole("textbox")).toBeDisabled();

      const timeEnoughRadioButtons = page.getByTestId(
        "eligibility-time-enough-radio-buttons",
      );
      await expect(timeEnoughRadioButtons).toBeVisible();
      await expect(
        timeEnoughRadioButtons.getByRole("radio").first(),
      ).toBeDisabled();

      await expect(
        page.getByRole("button", { name: "Enregistrer" }),
      ).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "Réinitialiser" }),
      ).toBeEnabled();
    });
  });

  test.describe("Existing candidate eligibility", () => {
    test.describe("DETENTEUR_RECEVABILITE eligibility", () => {
      test.use({
        mswHandlers: [
          [...aapCommonHandlers, ...createEligibilityHandlers()],
          { scope: "test" },
        ],
      });

      test("should handle DETENTEUR_RECEVABILITE eligibility with future date validation", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(
          `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/eligibility`,
        );
        await waitForEligibilityQueries(page);

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeDisabled();
        await expect(
          page.getByRole("button", { name: "Réinitialiser" }),
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

        const timeEnoughRadioButtons = page.getByTestId(
          "eligibility-time-enough-radio-buttons",
        );
        await expect(timeEnoughRadioButtons).toBeVisible();
        await expect(timeEnoughRadioButtons.getByText("Oui")).toBeEnabled();
        await timeEnoughRadioButtons.getByText("Oui").click();

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeEnabled();
        await expect(
          page.getByRole("button", { name: "Réinitialiser" }),
        ).toBeEnabled();
      });

      test("should show error message when submitting DETENTEUR_RECEVABILITE eligibility with past date", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(
          `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/eligibility`,
        );
        await waitForEligibilityQueries(page);

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeDisabled();
        await expect(
          page.getByRole("button", { name: "Réinitialiser" }),
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

        const timeEnoughRadioButtons = page.getByTestId(
          "eligibility-time-enough-radio-buttons",
        );
        await expect(timeEnoughRadioButtons).toBeVisible();
        await expect(timeEnoughRadioButtons.getByText("Oui")).toBeEnabled();
        await timeEnoughRadioButtons.getByText("Oui").click();

        await expect(
          validUntilInput.locator('[class*="fr-error-text"]'),
        ).not.toBeVisible();

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeEnabled();
        await expect(
          page.getByRole("button", { name: "Réinitialiser" }),
        ).toBeEnabled();

        await page.getByRole("button", { name: "Enregistrer" }).click();

        await expect(
          validUntilInput.locator('[class*="fr-error-text"]'),
        ).toBeVisible();
      });
    });

    test.describe("RNCP code changes", () => {
      test.use({
        mswHandlers: [
          [...aapCommonHandlers, ...createEligibilityHandlers()],
          { scope: "test" },
        ],
      });

      test("should disable date and time fields when DETENTEUR_RECEVABILITE_AVEC_CHGT_CODE_RNCP_ET_REV_REFERENTIEL eligibility is selected", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(
          `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/eligibility`,
        );
        await waitForEligibilityQueries(page);

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeDisabled();
        await expect(
          page.getByRole("button", { name: "Réinitialiser" }),
        ).toBeDisabled();

        const eligibilitySelect = page.getByTestId("eligibility-select");
        await eligibilitySelect
          .locator("select")
          .selectOption(
            "DETENTEUR_RECEVABILITE_AVEC_CHGT_CODE_RNCP_ET_REV_REFERENTIEL",
          );

        const validUntilInput = page.getByTestId(
          "eligibility-valid-until-input",
        );
        await expect(validUntilInput).toBeVisible();
        await expect(validUntilInput.getByRole("textbox")).toBeDisabled();

        const timeEnoughRadioButtons = page.getByTestId(
          "eligibility-time-enough-radio-buttons",
        );
        await expect(timeEnoughRadioButtons).toBeVisible();
        await expect(timeEnoughRadioButtons.getByText("Oui")).toBeDisabled();

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeEnabled();
        await expect(
          page.getByRole("button", { name: "Réinitialiser" }),
        ).toBeEnabled();
      });
    });

    test.describe("No RNCP code changes", () => {
      test.use({
        mswHandlers: [
          [...aapCommonHandlers, ...createEligibilityHandlers()],
          { scope: "test" },
        ],
      });

      test("should handle DETENTEUR_RECEVABILITE_AVEC_REV_SANS_CHGT_REFERENTIEL eligibility with future date validation", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(
          `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/eligibility`,
        );
        await waitForEligibilityQueries(page);

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeDisabled();
        await expect(
          page.getByRole("button", { name: "Réinitialiser" }),
        ).toBeDisabled();

        const eligibilitySelect = page.getByTestId("eligibility-select");
        await eligibilitySelect
          .locator("select")
          .selectOption(
            "DETENTEUR_RECEVABILITE_AVEC_REV_SANS_CHGT_REFERENTIEL",
          );

        const validUntilInput = page.getByTestId(
          "eligibility-valid-until-input",
        );
        await expect(validUntilInput).toBeVisible();
        const dateInput = validUntilInput.getByRole("textbox");
        await expect(dateInput).toBeEnabled();
        await dateInput.clear();
        await dateInput.fill(DF_FORMATED_DATE_6_MONTHS_FROM_NOW);

        const timeEnoughRadioButtons = page.getByTestId(
          "eligibility-time-enough-radio-buttons",
        );
        await expect(timeEnoughRadioButtons).toBeVisible();
        await expect(timeEnoughRadioButtons.getByText("Oui")).toBeEnabled();
        await timeEnoughRadioButtons.getByText("Oui").click();

        await expect(
          page.getByRole("button", { name: "Enregistrer" }),
        ).toBeEnabled();
        await expect(
          page.getByRole("button", { name: "Réinitialiser" }),
        ).toBeEnabled();
      });
    });
  });
});
