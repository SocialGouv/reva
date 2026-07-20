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

const FILE_TITLES = {
  SWORN_STATEMENT: "Joindre l'attestation sur l'honneur complétée et signée",
} as const;

const CANDIDACY_ID = "57bf364b-8c8b-4ff4-889b-66917e26d7d0";
const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

function createSwornStatementHandlers() {
  return [
    fvae.query(
      "feasibilityWithDematerializedFeasibilityFileWithSwornStatementByCandidacyId",
      graphQLResolver({
        feasibility_getActiveFeasibilityByCandidacyId: {
          dematerializedFeasibilityFile: {
            swornStatementFile: null,
          },
        },
      }),
    ),
  ];
}

async function visitFeasibilitySwornStatement(page: Page) {
  await login({ role: "aapCollaborateur", page });
  await page.goto(
    `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/sworn-statement`,
  );
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(
      page,
      "feasibilityWithDematerializedFeasibilityFileWithSwornStatementByCandidacyId",
    ),
  ]);
}

test.describe("Dematerialized Feasibility File - Attachments Page", () => {
  test.describe("Initial form state", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createSwornStatementHandlers()],
        { scope: "test" },
      ],
    });

    test("should display an empty form with enabled submit button", async ({
      page,
    }) => {
      await visitFeasibilitySwornStatement(page);

      await expect(page.getByTestId("form-buttons")).toBeVisible();
    });
  });

  test.describe("Document upload and preview functionality", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createSwornStatementHandlers()],
        { scope: "test" },
      ],
    });

    test("should handle sworn statement upload with preview controls (required)", async ({
      page,
    }) => {
      await visitFeasibilitySwornStatement(page);

      await expect(
        page.getByTestId(
          `feasibility-files-preview-${FILE_TITLES.SWORN_STATEMENT}`,
        ),
      ).not.toBeVisible();

      await page
        .getByTestId("sworn-statement-upload")
        .locator('input[type="file"]')
        .setInputFiles({
          name: "test-file.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("test-file"),
        });

      const idCardPreview = page.getByTestId(
        `feasibility-files-preview-${FILE_TITLES.SWORN_STATEMENT}`,
      );
      await expect(idCardPreview).toBeVisible();
      await expect(idCardPreview.locator("iframe")).toBeVisible();

      const toggleButton = page.getByTestId(
        `feasibility-files-preview-${FILE_TITLES.SWORN_STATEMENT}-toggle`,
      );
      await expect(toggleButton).toBeVisible();

      await toggleButton.click();
      await expect(idCardPreview.locator("iframe")).not.toBeVisible();

      await toggleButton.click();
      await expect(idCardPreview.locator("iframe")).toBeVisible();

      await expect(
        page
          .getByTestId("form-buttons")
          .getByRole("button", { name: "Enregistrer" }),
      ).not.toBeDisabled();
    });
  });

  test.describe("Navigation", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createSwornStatementHandlers()],
        { scope: "test" },
      ],
    });

    test("should provide navigation back to feasibility summary", async ({
      page,
    }) => {
      await visitFeasibilitySwornStatement(page);

      await page.getByTestId("back-button").click();

      await expect(page).toHaveURL(/\/feasibility-aap/);
    });
  });
});
