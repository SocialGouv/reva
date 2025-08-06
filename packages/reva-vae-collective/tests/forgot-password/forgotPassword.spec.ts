import {
  test,
  expect,
  graphql,
  HttpResponse,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../shared/utils/auth/login";

const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("Forgot password", () => {
  test.use({
    mswHandlers: [
      [
        fvae.mutation("account_sendForgotPasswordEmail", () => {
          return HttpResponse.json({
            data: {
              account_sendForgotPasswordEmail: null,
            },
          });
        }),
      ],
      { scope: "test" },
    ],
  });

  test("it should display the forgot password page when i access it", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });
    await page.goto("/vae-collective/forgot-password");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Récupération de mot de passe sur France VAE",
    );
  });

  test("it should let me type an email and redirect me to the forgot password confirmation page", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });

    await page.goto("/vae-collective/forgot-password");

    await page.fill("input[name='email']", "test@test.com");
    await page.getByRole("button", { name: "Envoyer la demande" }).click();

    await expect(page).toHaveURL(
      "/vae-collective/forgot-password-confirmation",
    );
  });
});
