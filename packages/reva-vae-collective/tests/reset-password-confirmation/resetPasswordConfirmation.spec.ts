import { test, expect } from "next/experimental/testmode/playwright/msw";

import { login } from "../shared/utils/auth/login";

test.describe("Reset password confirmation", () => {
  test("it should display the reset password confirmation page when i access it", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });
    await page.goto("/vae-collective/reset-password-confirmation");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Votre mot de passe a bien été réinitialisé.",
    );
  });
});
