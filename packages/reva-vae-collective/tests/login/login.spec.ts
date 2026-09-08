import {
  test,
  expect,
  graphql,
  HttpResponse,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../shared/utils/auth/login";

const fvae = graphql.link("https://reva-api/api/graphql");

const successAccount = {
  commanditaireVaeCollective: {
    id: "115c2693-b625-491b-8b91-c7b3875d86a0",
  },
};
const successTokens = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
};

test.describe("Login", () => {
  test.use({
    mswHandlers: [
      [
        fvae.mutation("Login", () => {
          return HttpResponse.json({
            data: {
              account_loginWithCredentials: {
                requiresOtp: false,
                otpChallengeToken: null,
                otpType: "none",
                tokens: successTokens,
                account: successAccount,
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

test.describe("Login with authenticator OTP", () => {
  test.use({
    mswHandlers: [
      [
        fvae.mutation("Login", () => {
          return HttpResponse.json({
            data: {
              account_loginWithCredentials: {
                requiresOtp: true,
                otpChallengeToken: "challenge-token",
                otpType: "authenticator",
                tokens: null,
                account: successAccount,
              },
            },
          });
        }),
        fvae.mutation("VerifyOtpChallengeVaeCollective", () => {
          return HttpResponse.json({
            data: {
              account_verifyOtpChallenge: {
                tokens: successTokens,
                account: successAccount,
              },
            },
          });
        }),
      ],
      { scope: "test" },
    ],
  });

  test("it should show the authenticator OTP step and redirect to post-login after a valid code", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });

    await page.goto("/vae-collective/login");

    await page.fill("input[name='email']", "test@test.com");
    await page.fill("input[name='password']", "password");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(
      page.getByRole("textbox", { name: "Code de vérification" }),
    ).toBeVisible();

    await page.fill("input[name='otp']", "123456");
    await page.getByRole("button", { name: "Valider le code" }).click();

    await expect(page).toHaveURL((url) =>
      url.pathname.startsWith("/vae-collective/post-login"),
    );
  });
});

test.describe("Login with email OTP", () => {
  test.use({
    mswHandlers: [
      [
        fvae.mutation("Login", () => {
          return HttpResponse.json({
            data: {
              account_loginWithCredentials: {
                requiresOtp: true,
                otpChallengeToken: "challenge-token",
                otpType: "email",
                tokens: null,
                account: successAccount,
              },
            },
          });
        }),
        fvae.mutation("VerifyOtpChallengeVaeCollective", () => {
          return HttpResponse.json({
            data: {
              account_verifyOtpChallenge: {
                tokens: successTokens,
                account: successAccount,
              },
            },
          });
        }),
        fvae.mutation("ResendEmailOtpVaeCollective", () => {
          return HttpResponse.json({
            data: { account_resendEmailOtp: true },
          });
        }),
      ],
      { scope: "test" },
    ],
  });

  test("it should show the email OTP step and redirect to post-login after a valid code", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });

    await page.goto("/vae-collective/login");

    await page.fill("input[name='email']", "test@test.com");
    await page.fill("input[name='password']", "password");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(
      page.getByRole("textbox", { name: "Vérification de votre identité" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Renvoyer un code" }),
    ).toBeVisible();

    await page.fill("input[name='otp']", "123456");
    await page.getByRole("button", { name: "Valider" }).click();

    await expect(page).toHaveURL((url) =>
      url.pathname.startsWith("/vae-collective/post-login"),
    );
  });

  test("it should show a success alert after resending the email OTP code", async ({
    page,
  }) => {
    await login({ page, role: "notConnected" });

    await page.goto("/vae-collective/login");

    await page.fill("input[name='email']", "test@test.com");
    await page.fill("input[name='password']", "password");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await page.getByRole("button", { name: "Renvoyer un code" }).click();

    await expect(
      page.getByText("Un nouveau code a été envoyé à test@test.com."),
    ).toBeVisible();
  });
});
