import {
  test,
  expect,
  graphql,
  HttpResponse,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../shared/utils/auth/login";

const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("Login page", () => {
  test.use({
    mswHandlers: [
      [
        fvae.mutation("Login", () => {
          return HttpResponse.json({
            data: {
              account_loginWithCredentials: {
                tokens: {
                  accessToken: "accessToken",
                  refreshToken: "refreshToken",
                  idToken: "idToken",
                },
                account: {
                  commanditaireVaeCollective: {
                    id: "115c2693-b625-491b-8b91-c7b3875d86a0",
                  },
                },
              },
            },
          });
        }),
      ],
      { scope: "test" },
    ],
  });

  test("it should display the login page when i access it", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });
    await page.goto("/vae-collective/login");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Connexion à l’espace Porteur de projet VAE collective",
    );
  });

  test("it should let me login and redirect me to the post-login page", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });

    await page.goto("/vae-collective/login");

    await page.fill("input[name='email']", "test@test.com");
    await page.fill("input[name='password']", "password");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page).toHaveURL((url) =>
      url.pathname.startsWith("/vae-collective/post-login"),
    );
  });

  test("it should lead me to the forgot password page when i click on the forgot password link", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });

    await page.goto("/vae-collective/login");

    await page.getByRole("link", { name: "Mot de passe oublié ?" }).click();

    await expect(page).toHaveURL("/vae-collective/forgot-password");
  });
});
