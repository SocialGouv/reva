import {
  test,
  expect,
  graphql,
  HttpResponse,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../shared/utils/auth/login";

const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("Reset password", () => {
  test.use({
    mswHandlers: [
      [
        fvae.mutation("resetPassword", () => {
          return HttpResponse.json({
            data: {
              account_resetPassword: null,
            },
          });
        }),
      ],
      { scope: "test" },
    ],
  });

  test("it should display the reset password page when i access it", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });
    await page.goto("/vae-collective/reset-password");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Réinitialiser votre mot de passe",
    );
  });

  test("it should let me type my new password and redirect me to the reset password confirmation page", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });

    await page.goto("/vae-collective/reset-password");

    await page.fill("input[name='password']", "Password12345!");
    await page.fill("input[name='passwordConfirmation']", "Password12345!");

    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page).toHaveURL("/vae-collective/reset-password-confirmation");
  });
});
