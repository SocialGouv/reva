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

function createPrerequisitesHandlers() {
  return [
    fvae.query(
      "feasibilityWithDematerializedFeasibilityFileByCandidacyId",
      graphQLResolver({
        feasibility_getActiveFeasibilityByCandidacyId: {
          dematerializedFeasibilityFile: {
            prerequisitesPartComplete: false,
            prerequisites: [],
            dffAndCertificationPrerequisites: [],
          },
        },
      }),
    ),
  ];
}

async function visitFeasibilityPrerequisites(page: Page) {
  await login({ role: "aapCollaborateur", page });
  await page.goto(
    `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/prerequisites`,
  );
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(
      page,
      "feasibilityWithDematerializedFeasibilityFileByCandidacyId",
    ),
  ]);
}

test.describe("Dematerialized Feasibility File - Prerequisites Page", () => {
  test.describe("Initial form state", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createPrerequisitesHandlers()],
        { scope: "test" },
      ],
    });

    test("should display an empty prerequisites form with enabled submit button if prerequisites have never been saved", async ({
      page,
    }) => {
      await visitFeasibilityPrerequisites(page);

      const formButtons = page.getByTestId("form-buttons");
      await expect(formButtons).toBeVisible();
      await expect(
        formButtons.getByRole("button", { name: "Enregistrer" }),
      ).toBeEnabled();
    });
  });

  test.describe("No Prerequisites message", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createPrerequisitesHandlers()],
        { scope: "test" },
      ],
    });

    test("should display a message if no prerequisites are required", async ({
      page,
    }) => {
      await visitFeasibilityPrerequisites(page);

      await expect(page.getByTestId("no-prerequisites-message")).toBeVisible();
    });
  });

  test.describe("Prerequisites Management", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createPrerequisitesHandlers()],
        { scope: "test" },
      ],
    });

    test("should show error when submitting with empty prerequisite label", async ({
      page,
    }) => {
      await visitFeasibilityPrerequisites(page);

      await page.getByTestId("add-prerequisite-button").click();

      const prerequisite0 = page.getByTestId("prerequisite-input-0");
      await expect(prerequisite0).toBeVisible();
      await prerequisite0.getByText("Oui").check();
      await expect(prerequisite0.getByText("Oui")).toBeChecked();

      await page
        .getByTestId("form-buttons")
        .getByRole("button", { name: "Enregistrer" })
        .click();

      await expect(prerequisite0.locator(".fr-error-text")).toBeVisible();
    });

    test("should allow adding multiple prerequisites with different states", async ({
      page,
    }) => {
      await visitFeasibilityPrerequisites(page);

      await page.getByTestId("add-prerequisite-button").click();

      const prerequisite0 = page.getByTestId("prerequisite-input-0");
      await expect(prerequisite0).toBeVisible();
      await prerequisite0.getByRole("textbox").fill("First prerequisite");
      await prerequisite0.getByText("Oui").check();

      await page.getByTestId("add-prerequisite-button").click();

      const prerequisite1 = page.getByTestId("prerequisite-input-1");
      await expect(prerequisite1).toBeVisible();
      await prerequisite1.getByRole("textbox").fill("Second prerequisite");
      await prerequisite1.getByText("Non").check();

      const formButtons = page.getByTestId("form-buttons");
      await expect(formButtons).toBeVisible();
      await expect(
        formButtons.getByRole("button", { name: "Enregistrer" }),
      ).not.toBeDisabled();
    });

    test("should allow removing individual prerequisites", async ({ page }) => {
      await visitFeasibilityPrerequisites(page);

      await page.getByTestId("add-prerequisite-button").click();

      await page
        .getByTestId("prerequisite-input-0")
        .getByRole("textbox")
        .fill("To be deleted");

      await page.getByTestId("add-prerequisite-button").click();

      await expect(page.getByTestId("prerequisite-input-0")).toBeVisible();
      await expect(page.getByTestId("prerequisite-input-1")).toBeVisible();

      await page.getByTestId("delete-prerequisite-button-0").click();

      await expect(page.getByTestId("prerequisite-input-0")).toBeVisible();
      await expect(page.getByTestId("prerequisite-input-1")).not.toBeVisible();
    });

    test("should allow toggling between all prerequisite states", async ({
      page,
    }) => {
      await visitFeasibilityPrerequisites(page);

      await page.getByTestId("add-prerequisite-button").click();

      const prerequisite0 = page.getByTestId("prerequisite-input-0");
      await expect(prerequisite0).toBeVisible();
      await prerequisite0.getByRole("textbox").fill("Test prerequisite");
      await prerequisite0.getByText("Oui").check();
      await prerequisite0.getByText("Non").check();
    });
  });

  test.describe("Navigation", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createPrerequisitesHandlers()],
        { scope: "test" },
      ],
    });

    test("should provide navigation back to feasibility summary", async ({
      page,
    }) => {
      await visitFeasibilityPrerequisites(page);

      await page.getByTestId("back-button").click();

      await expect(page).toHaveURL(/\/feasibility-aap/);
    });
  });
});
