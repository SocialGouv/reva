import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../shared/helpers/auth/login";

const fvae = graphql.link("https://reva-api/api/graphql");

const MOCK_EMAIL = "user@example.fr";
const MOCK_PASSWORD = "password123";
const MOCK_OTP = "123456";

function createCredentialErrorHandler() {
  return fvae.mutation("LoginAdmin", () =>
    HttpResponse.json({
      errors: [
        { message: "Unauthorized", extensions: { code: "UNAUTHORIZED" } },
      ],
    }),
  );
}

function createServiceUnavailableHandler() {
  return fvae.mutation("LoginAdmin", () =>
    HttpResponse.json({
      errors: [
        {
          message: "Keycloak unavailable",
          extensions: { code: "KEYCLOAK_UNAVAILABLE" },
        },
      ],
    }),
  );
}

function createAuthenticatorOtpRequiredHandler() {
  return fvae.mutation("LoginAdmin", () =>
    HttpResponse.json({
      data: {
        account_loginWithCredentials: {
          requiresOtp: true,
          otpChallengeToken: "mock-otp-challenge-token",
          otpType: "authenticator",
          tokens: null,
        },
      },
    }),
  );
}

function createEmailOtpRequiredHandler() {
  return fvae.mutation("LoginAdmin", () =>
    HttpResponse.json({
      data: {
        account_loginWithCredentials: {
          requiresOtp: true,
          otpChallengeToken: "mock-otp-challenge-token",
          otpType: "email",
          tokens: null,
        },
      },
    }),
  );
}

function createOtpVerifyErrorHandler(_otpType: "authenticator" | "email") {
  return fvae.mutation("VerifyOtpChallenge", () =>
    HttpResponse.json({
      errors: [{ message: "Invalid OTP", extensions: { code: "INVALID_OTP" } }],
    }),
  );
}

function createResendEmailOtpHandler() {
  return fvae.mutation("ResendEmailOtp", () =>
    HttpResponse.json({
      data: { account_resendEmailOtp: true },
    }),
  );
}

async function fillAndSubmitCredentials(
  page: Parameters<typeof login>[0]["page"],
  email = MOCK_EMAIL,
  password = MOCK_PASSWORD,
) {
  await page.getByLabel("Identifiant").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

test.describe("Login tests", () => {
  test("it should redirect to the login page when i try to access the root page without being authenticated", async ({
    page,
  }) => {
    login({ page, role: "aap", loginRequired: true });
    await page.goto("/admin2");

    await expect(
      page.getByText("Connexion à votre espace professionnel"),
    ).toBeVisible();
  });

  test.describe("login form rendering", () => {
    test("it should display the credentials form with all expected elements", async ({
      page,
    }) => {
      login({ page, role: "aap", loginRequired: true });
      await page.goto("/admin2/login");

      await expect(
        page.getByRole("heading", {
          name: "Connexion à votre espace professionnel",
        }),
      ).toBeVisible();
      await expect(page.getByLabel("Identifiant")).toBeVisible();
      await expect(page.getByLabel("Mot de passe")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Se connecter" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Mot de passe oublié ?" }),
      ).toBeVisible();
    });

    test("it should display AAP and certificateur registration links", async ({
      page,
    }) => {
      login({ page, role: "aap", loginRequired: true });
      await page.goto("/admin2/login");

      await expect(
        page.getByRole("link", {
          name: "Espace Architecte Accompagnateur de Parcours",
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Espace Certificateur" }),
      ).toBeVisible();
    });
  });

  test.describe("credentials step errors", () => {
    test.use({
      mswHandlers: [[createCredentialErrorHandler()], { scope: "test" }],
    });

    test("it should show an error message for invalid credentials", async ({
      page,
    }) => {
      login({ page, role: "aap", loginRequired: true });
      await page.goto("/admin2/login");

      await fillAndSubmitCredentials(page);

      await expect(
        page.getByText("Adresse électronique ou mot de passe incorrect"),
      ).toBeVisible();
    });
  });

  test.describe("service unavailable error", () => {
    test.use({
      mswHandlers: [[createServiceUnavailableHandler()], { scope: "test" }],
    });

    test("it should show a service unavailable error message", async ({
      page,
    }) => {
      login({ page, role: "aap", loginRequired: true });
      await page.goto("/admin2/login");

      await fillAndSubmitCredentials(page);

      await expect(
        page.getByText("Service indisponible, merci de réessayer plus tard."),
      ).toBeVisible();
    });
  });

  test.describe("Authenticator OTP", () => {
    test.describe("Authenticator OTP main flow", () => {
      test.use({
        mswHandlers: [
          [createAuthenticatorOtpRequiredHandler()],
          { scope: "test" },
        ],
      });

      test("it should show the authenticator OTP step after valid credentials", async ({
        page,
      }) => {
        login({ page, role: "aap", loginRequired: true });
        await page.goto("/admin2/login");

        await fillAndSubmitCredentials(page);

        await expect(page.getByLabel("Code de vérification")).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Valider le code" }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Retour à la connexion" }),
        ).toBeVisible();
      });

      test("it should return to the credentials form when cancelling the authenticator OTP step", async ({
        page,
      }) => {
        login({ page, role: "aap", loginRequired: true });
        await page.goto("/admin2/login");

        await fillAndSubmitCredentials(page);
        await expect(page.getByLabel("Code de vérification")).toBeVisible();

        await page
          .getByRole("button", { name: "Retour à la connexion" })
          .click();

        await expect(page.getByLabel("Identifiant")).toBeVisible();
        await expect(page.getByLabel("Mot de passe")).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Se connecter" }),
        ).toBeVisible();
      });
    });

    test.describe("Authenticator OTP verification error", () => {
      test.use({
        mswHandlers: [
          [
            createAuthenticatorOtpRequiredHandler(),
            createOtpVerifyErrorHandler("authenticator"),
          ],
          { scope: "test" },
        ],
      });

      test("it should show an error message for a wrong authenticator OTP code", async ({
        page,
      }) => {
        login({ page, role: "aap", loginRequired: true });
        await page.goto("/admin2/login");

        await fillAndSubmitCredentials(page);
        await expect(page.getByLabel("Code de vérification")).toBeVisible();

        await page.getByLabel("Code de vérification").fill(MOCK_OTP);
        await page.getByRole("button", { name: "Valider le code" }).click();

        await expect(
          page.getByText("Code de vérification incorrect"),
        ).toBeVisible();
      });
    });
  });

  test.describe("Email OTP", () => {
    test.describe("Email OTP main flow", () => {
      test.use({
        mswHandlers: [[createEmailOtpRequiredHandler()], { scope: "test" }],
      });

      test("it should show the email OTP step with info alert after valid credentials", async ({
        page,
      }) => {
        login({ page, role: "aap", loginRequired: true });
        await page.goto("/admin2/login");

        await fillAndSubmitCredentials(page);

        await expect(
          page.getByText(
            `Pour sécuriser votre accès, nous avons envoyé un code de vérification à ${MOCK_EMAIL}`,
          ),
        ).toBeVisible();
        await expect(
          page.getByLabel("Vérification de votre identité"),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Valider" }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Retour à la connexion" }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Renvoyer un code" }),
        ).toBeVisible();
      });

      test("it should return to the credentials form when cancelling the email OTP step", async ({
        page,
      }) => {
        login({ page, role: "aap", loginRequired: true });
        await page.goto("/admin2/login");

        await fillAndSubmitCredentials(page);
        await expect(
          page.getByLabel("Vérification de votre identité"),
        ).toBeVisible();

        await page
          .getByRole("button", { name: "Retour à la connexion" })
          .click();

        await expect(page.getByLabel("Identifiant")).toBeVisible();
        await expect(page.getByLabel("Mot de passe")).toBeVisible();
      });
    });

    test.describe("EmailOTP verification error", () => {
      test.use({
        mswHandlers: [
          [
            createEmailOtpRequiredHandler(),
            createOtpVerifyErrorHandler("email"),
          ],
          { scope: "test" },
        ],
      });

      test("it should show an error message for a wrong email OTP code", async ({
        page,
      }) => {
        login({ page, role: "aap", loginRequired: true });
        await page.goto("/admin2/login");

        await fillAndSubmitCredentials(page);
        await expect(
          page.getByLabel("Vérification de votre identité"),
        ).toBeVisible();

        await page.getByLabel("Vérification de votre identité").fill(MOCK_OTP);
        await page.getByRole("button", { name: "Valider" }).click();

        await expect(
          page.getByText(
            "Ce code est incorrect ou a expiré. Vérifiez votre email ou renvoyez un nouveau code",
          ),
        ).toBeVisible();
      });
    });

    test.describe("resend email OTP", () => {
      test.use({
        mswHandlers: [
          [createEmailOtpRequiredHandler(), createResendEmailOtpHandler()],
          { scope: "test" },
        ],
      });

      test("it should show a success alert after resending the email OTP code", async ({
        page,
      }) => {
        login({ page, role: "aap", loginRequired: true });
        await page.goto("/admin2/login");

        await fillAndSubmitCredentials(page);
        await expect(
          page.getByLabel("Vérification de votre identité"),
        ).toBeVisible();

        await page.getByRole("button", { name: "Renvoyer un code" }).click();

        await expect(
          page.getByText(`Un nouveau code a été envoyé à ${MOCK_EMAIL}.`),
        ).toBeVisible();
      });
    });
  });
});
