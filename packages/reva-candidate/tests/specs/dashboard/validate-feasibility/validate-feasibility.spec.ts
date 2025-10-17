import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  navigateToValidateFeasibility,
  validateFeasibilityHandlers,
} from "@tests/helpers/handlers/validate-feasibility/validate-feasibility.handler";

test.describe("Dematerialized feasibility résumé", () => {
  const { handlers, validateFeasibilityWait, candidacyId } =
    validateFeasibilityHandlers();

  test.use({
    mswHandlers: [handlers, { scope: "test" }],
  });

  test.beforeEach(async ({ page }) => {
    await page.route("https://files.example.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          "content-type": "application/pdf",
        },
        body: "fake-pdf-content",
      });
    });
  });

  test("displays the dematerialized feasibility summary with candidate data", async ({
    page,
  }) => {
    await login(page);
    await navigateToValidateFeasibility(page, candidacyId);
    await validateFeasibilityWait(page);

    await expect(
      page.getByRole("heading", { name: /Dossier de faisabilité/ }),
    ).toBeVisible();

    await expect(
      page.getByText("claire.dupont@example.com", { exact: false }),
    ).toBeVisible();
    await expect(page.getByText("Anglais")).toBeVisible();
    await expect(page.getByText("Espagnol")).toBeVisible();
    await expect(page.getByText("Favorable")).toBeVisible();

    await expect(
      page.getByText("Justifier de 2 ans d'experience en logistique"),
    ).toBeVisible();
    await expect(
      page.locator(
        'iframe[title="Joindre l’attestation sur l’honneur complétée et signée"]',
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Télécharger en PDF" }),
    ).toBeVisible();

    const submitButton = page.getByRole("button", { name: "Envoyer" });
    await expect(submitButton).toBeDisabled();

    await page
      .getByText("J'ai lu et accepte cette version du dossier.")
      .click();

    await expect(submitButton).toBeEnabled();
  });
});
