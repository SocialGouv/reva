import { expect, test } from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { graphQLResolver } from "@tests/helpers/network/msw";

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

    test("shows magic link login form", async ({ page }) => {
      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Se connecter avec un lien" }),
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
  });

  test.describe("when DISABLE_CANDIDATE_MAGIC_LINK_LOGIN is active", () => {
    const handlers = [
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser: ["DISABLE_CANDIDATE_MAGIC_LINK_LOGIN"],
        }),
      ),
    ];

    test.use({ mswHandlers: [handlers, { scope: "test" }] });

    test("hides magic link login form", async ({ page }) => {
      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Se connecter avec mot de passe" }),
      ).toBeVisible();

      await expect(
        page.getByRole("heading", { name: "Se connecter avec un lien" }),
      ).not.toBeVisible();
    });

    test("shows notice banner with password instructions", async ({ page }) => {
      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Se connecter avec mot de passe" }),
      ).toBeVisible();

      await expect(
        page.getByText(
          "Vous devez désormais vous connecter à votre espace candidat avec un mot de passe.",
        ),
      ).toBeVisible();

      await expect(
        page
          .getByTestId("magic-link-disabled-notice")
          .getByRole("link", { name: "Mot de passe oublié ?" }),
      ).toBeVisible();
    });
  });
});
