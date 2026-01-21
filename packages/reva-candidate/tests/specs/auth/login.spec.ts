import { expect, test } from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("Login page", () => {
  test.describe("when DISABLE_CANDIDATE_MAGIC_LINK_LOGIN is not active", () => {
    const handlers = [
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({ activeFeaturesForConnectedUser: [] }),
      ),
    ];

    test.use({ mswHandlers: [handlers, { scope: "test" }] });

    test("shows both login methods", async ({ page }) => {
      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Se connecter avec un lien" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Se connecter avec mot de passe" }),
      ).toBeVisible();
    });

    test("does not show notice banner", async ({ page }) => {
      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Se connecter avec un lien" }),
      ).toBeVisible();

      await expect(
        page.getByText(
          "Vous devez désormais vous connecter à votre espace candidat avec un mot de passe.",
        ),
      ).not.toBeVisible();
    });

    test("redirects to confirmation page after asking for a magic link", async ({
      page,
      msw,
    }) => {
      msw.use(
        fvae.mutation(
          "candidate_askForLogin",
          graphQLResolver({ candidate_askForLogin: "OK" }),
        ),
      );

      await login(page, { authenticated: false });

      await page
        .getByRole("textbox", { name: "Adresse électronique" })
        .fill("email@example.com");

      const mutationPromise = waitGraphQL(page, "candidate_askForLogin");

      await page.getByRole("button", { name: "Se connecter" }).click();
      await mutationPromise;

      await expect(
        page.getByRole("heading", { name: "Un courriel vous a été envoyé." }),
      ).toBeVisible();
    });
  });

  test.describe("when ENABLE_REGISTER_WITH_PASSWORD is active", () => {
    const handlers = [
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser: ["ENABLE_REGISTER_WITH_PASSWORD"],
        }),
      ),
    ];

    test.use({ mswHandlers: [handlers, { scope: "test" }] });

    test("navigates to register page when clicking create account", async ({
      page,
    }) => {
      await login(page, { authenticated: false });

      await page.getByRole("link", { name: "Créer mon compte" }).click();

      await expect(
        page.getByRole("heading", { name: "Création de compte" }),
      ).toBeVisible();
    });
  });

  test.describe("when DISABLE_CANDIDATE_MAGIC_LINK_LOGIN is active", () => {
    const handlers = [
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser: [
            "DISABLE_CANDIDATE_MAGIC_LINK_LOGIN",
          ],
        }),
      ),
    ];

    test.use({ mswHandlers: [handlers, { scope: "test" }] });

    test("hides magic link login form", async ({ page }) => {
      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Connexion candidat" }),
      ).toBeVisible();

      await expect(
        page.getByRole("heading", { name: "Se connecter avec un lien" }),
      ).not.toBeVisible();
    });

    test("shows only password login form without heading", async ({ page }) => {
      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Se connecter avec mot de passe" }),
      ).not.toBeVisible();
      await expect(page.getByLabel("Identifiant")).toBeVisible();
      await expect(page.getByLabel("Mot de passe")).toBeVisible();
    });

    test("shows notice banner with password instructions", async ({ page }) => {
      await login(page, { authenticated: false });

      const noticeBanner = page.getByTestId("magic-link-disabled-notice");

      await expect(
        noticeBanner.getByText(
          "Vous devez désormais vous connecter à votre espace candidat avec un mot de passe.",
        ),
      ).toBeVisible();

      await expect(
        noticeBanner.getByRole("link", { name: "Mot de passe oublié ?" }),
      ).toBeVisible();
    });
  });
});
