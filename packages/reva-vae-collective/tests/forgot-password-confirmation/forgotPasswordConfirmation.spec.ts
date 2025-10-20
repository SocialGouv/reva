import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "../shared/utils/auth/login";

test.describe("Forgot password confirmation", () => {
  test("it should display the forgot password confirmation page when i access it", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });
    await page.goto("/vae-collective/forgot-password-confirmation");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Un courriel vous a été envoyé.",
    );
  });
});
