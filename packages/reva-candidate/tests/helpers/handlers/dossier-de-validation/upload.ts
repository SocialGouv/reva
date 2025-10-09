import { Page } from "next/experimental/testmode/playwright/msw";

export async function uploadFile(
  page: Page,
  selector: string,
  fileName: string,
  content: string,
  mimeType: string = "application/pdf",
) {
  await page.locator(selector).setInputFiles({
    name: fileName,
    mimeType: mimeType,
    buffer: Buffer.from(content),
  });
}

export async function mockDossierValidationUpload(page: Page) {
  await page.route(
    "**/api/dossier-de-validation/upload-dossier-de-validation",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            candidate_getCandidateWithCandidacy: {
              candidacy: {
                id: "candidacy-id",
                status: "DOSSIER_FAISABILITE_RECEVABLE",
              },
            },
          },
        }),
      });
    },
  );
}
