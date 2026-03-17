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

const CANDIDACY_ID = "57bf364b-8c8b-4ff4-889b-66917e26d7d0";
const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

function createAapDecisionHandlers() {
  return [
    fvae.query(
      "feasibilityWithDematerializedFeasibilityFileDecisionByCandidacyId",
      graphQLResolver({}),
    ),
  ];
}

async function visitFeasibilityDecision(page: Page) {
  await login({ role: "aapCollaborateur", page });
  await page.goto(
    `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/decision`,
  );
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(
      page,
      "feasibilityWithDematerializedFeasibilityFileDecisionByCandidacyId",
    ),
  ]);
}

test.describe("Dematerialized Feasibility File - AAP Decision Page", () => {
  test.describe("Initial form state", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createAapDecisionHandlers()],
        { scope: "test" },
      ],
    });

    test("should display an empty form with submit button disabled", async ({
      page,
    }) => {
      await visitFeasibilityDecision(page);

      const formButtons = page.getByTestId("form-buttons");
      await expect(formButtons).toBeVisible();
      await expect(
        formButtons.getByRole("button", { name: "Enregistrer" }),
      ).toBeDisabled();
    });
  });

  test.describe("Decision form validation and submission", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createAapDecisionHandlers()],
        { scope: "test" },
      ],
    });

    test("should display an error when submitting without selecting a decision", async ({
      page,
    }) => {
      await visitFeasibilityDecision(page);

      await page
        .getByTestId("aap-decision-comment-input")
        .getByRole("textbox")
        .fill("This is a valid comment for the decision");

      await page
        .getByTestId("form-buttons")
        .getByRole("button", { name: "Enregistrer" })
        .click();

      await expect(
        page
          .getByTestId("aap-decision-radio-buttons")
          .locator(".fr-message--error"),
      ).toBeVisible();
    });

    test("should display an error when submitting without a comment", async ({
      page,
    }) => {
      await visitFeasibilityDecision(page);

      await page
        .getByTestId("aap-decision-radio-buttons")
        .getByText("Favorable", { exact: true })
        .check();

      await page
        .getByTestId("form-buttons")
        .getByRole("button", { name: "Enregistrer" })
        .click();

      await expect(page.locator(".fr-error-text")).toBeVisible();
    });

    test("should enable submit button when form is filled correctly", async ({
      page,
    }) => {
      await visitFeasibilityDecision(page);

      await page
        .getByTestId("aap-decision-radio-buttons")
        .getByText("Favorable", { exact: true })
        .check();

      await page
        .getByTestId("aap-decision-comment-input")
        .getByRole("textbox")
        .fill("This is a valid comment for the decision");

      const formButtons = page.getByTestId("form-buttons");
      await expect(formButtons).toBeVisible();
      await expect(
        formButtons.getByRole("button", { name: "Enregistrer" }),
      ).not.toBeDisabled();
    });

    test("should allow switching between favorable and unfavorable decisions", async ({
      page,
    }) => {
      await visitFeasibilityDecision(page);

      const radioButtons = page.getByTestId("aap-decision-radio-buttons");

      await radioButtons.getByText("Favorable", { exact: true }).check();
      await radioButtons.getByText("Non favorable", { exact: true }).check();
    });
  });

  test.describe("Navigation", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createAapDecisionHandlers()],
        { scope: "test" },
      ],
    });

    test("should provide a back link to the feasibility summary", async ({
      page,
    }) => {
      await visitFeasibilityDecision(page);

      await page.getByTestId("back-button").click();

      await expect(page).toHaveURL(/\/feasibility-aap/);
    });
  });
});
