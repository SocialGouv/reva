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
  ID_CARD: "Pièce d'identité",
  EQUIVALENCE_PROOF: "Justificatif d'équivalence ou de dispense (optionnel)",
  TRAINING_CERTIFICATE: "Attestation ou certificat de formation (optionnel)",
  ADDITIONAL_FILE: "Pièce jointe supplémentaire",
} as const;

const CANDIDACY_ID = "57bf364b-8c8b-4ff4-889b-66917e26d7d0";
const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

function createAttachmentsHandlers() {
  return [
    fvae.query(
      "feasibilityWithDematerializedFeasibilityFileAttachmentsByCandidacyId",
      graphQLResolver({
        feasibility_getActiveFeasibilityByCandidacyId: {
          dematerializedFeasibilityFile: {
            attachments: [],
          },
        },
      }),
    ),
  ];
}

async function visitFeasibilityAttachments(page: Page) {
  await login({ role: "aapCollaborateur", page });
  await page.goto(
    `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/attachments`,
  );
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(
      page,
      "feasibilityWithDematerializedFeasibilityFileAttachmentsByCandidacyId",
    ),
  ]);
}

test.describe("Dematerialized Feasibility File - Attachments Page", () => {
  test.describe("Initial form state", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createAttachmentsHandlers()],
        { scope: "test" },
      ],
    });

    test("should display an empty form with enabled submit button", async ({
      page,
    }) => {
      await visitFeasibilityAttachments(page);

      await expect(page.getByTestId("form-buttons")).toBeVisible();
    });
  });

  test.describe("Document upload and preview functionality", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createAttachmentsHandlers()],
        { scope: "test" },
      ],
    });

    test("should handle ID card upload with preview controls (required)", async ({
      page,
    }) => {
      await visitFeasibilityAttachments(page);

      await expect(
        page.getByTestId(`feasibility-files-preview-${FILE_TITLES.ID_CARD}`),
      ).not.toBeVisible();

      await page
        .getByTestId("id-card-upload")
        .locator('input[type="file"]')
        .setInputFiles({
          name: "test-file.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("test-file"),
        });

      const idCardPreview = page.getByTestId(
        `feasibility-files-preview-${FILE_TITLES.ID_CARD}`,
      );
      await expect(idCardPreview).toBeVisible();
      await expect(idCardPreview.locator("iframe")).toBeVisible();

      const toggleButton = page.getByTestId(
        `feasibility-files-preview-${FILE_TITLES.ID_CARD}-toggle`,
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

    test("should handle equivalence proof upload with preview (optional)", async ({
      page,
    }) => {
      await visitFeasibilityAttachments(page);

      await page
        .getByTestId("equivalence-proof-upload")
        .locator('input[type="file"]')
        .setInputFiles({
          name: "test-file.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("test-file"),
        });

      await expect(
        page
          .getByTestId(
            `feasibility-files-preview-${FILE_TITLES.EQUIVALENCE_PROOF}`,
          )
          .locator("iframe"),
      ).toBeVisible();
    });

    test("should handle training certificate upload with preview (optional)", async ({
      page,
    }) => {
      await visitFeasibilityAttachments(page);

      await page
        .getByTestId("training-certificate-upload")
        .locator('input[type="file"]')
        .setInputFiles({
          name: "test-file.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("test-file"),
        });

      await expect(
        page
          .getByTestId(
            `feasibility-files-preview-${FILE_TITLES.TRAINING_CERTIFICATE}`,
          )
          .locator("iframe"),
      ).toBeVisible();
    });

    test("should verify optional files start as non-existent", async ({
      page,
    }) => {
      await visitFeasibilityAttachments(page);

      await expect(
        page.getByTestId(
          `feasibility-files-preview-${FILE_TITLES.EQUIVALENCE_PROOF}`,
        ),
      ).not.toBeVisible();
      await expect(
        page.getByTestId(
          `feasibility-files-preview-${FILE_TITLES.TRAINING_CERTIFICATE}`,
        ),
      ).not.toBeVisible();
    });
  });

  test.describe("Additional files management", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createAttachmentsHandlers()],
        { scope: "test" },
      ],
    });

    test("should allow adding and removing additional files", async ({
      page,
    }) => {
      await visitFeasibilityAttachments(page);

      await page.getByTestId("add-additional-file-button").click();

      const additionalFile = page.getByTestId("additional-file-0");
      await expect(additionalFile).toBeVisible();

      await additionalFile.getByTestId("delete-file-button").click();

      await expect(page.getByTestId("additional-file-0")).not.toBeVisible();
    });

    test("should enforce maximum limit of 8 additional files", async ({
      page,
    }) => {
      await visitFeasibilityAttachments(page);

      const addButton = page.getByTestId("add-additional-file-button");

      for (let i = 0; i < 8; i++) {
        await expect(addButton).toBeVisible();
        await addButton.click();
      }

      await expect(addButton).not.toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createAttachmentsHandlers()],
        { scope: "test" },
      ],
    });

    test("should provide navigation back to feasibility summary", async ({
      page,
    }) => {
      await visitFeasibilityAttachments(page);

      await page.getByTestId("back-button").click();

      await expect(page).toHaveURL(/\/feasibility-aap/);
    });
  });
});
