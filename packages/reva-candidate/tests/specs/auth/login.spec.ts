import { expect, test } from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { graphQLResolver } from "@tests/helpers/network/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("Login page", () => {
  test.describe("when DISABLE_CANDIDATE_MAGIC_LINK_LOGIN is not active", () => {
    test("shows magic link login form", async ({ page, msw }) => {
      msw.use(
        fvae.query(
          "activeFeaturesForConnectedUser",
          graphQLResolver({ activeFeaturesForConnectedUser: [] }),
        ),
      );

      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Se connecter avec un lien" }),
      ).toBeVisible();
    });
  });

  test.describe("when DISABLE_CANDIDATE_MAGIC_LINK_LOGIN is active", () => {
    test("hides magic link login form", async ({ page, msw }) => {
      msw.use(
        fvae.query(
          "activeFeaturesForConnectedUser",
          graphQLResolver({
            activeFeaturesForConnectedUser: [
              "DISABLE_CANDIDATE_MAGIC_LINK_LOGIN",
            ],
          }),
        ),
      );

      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Se connecter avec mot de passe" }),
      ).toBeVisible();

      await expect(
        page.getByRole("heading", { name: "Se connecter avec un lien" }),
      ).not.toBeVisible();
    });
  });
});
