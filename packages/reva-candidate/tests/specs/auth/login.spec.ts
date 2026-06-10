import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { graphQLResolver } from "@tests/helpers/network/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("Login page", () => {
  test.describe("default", () => {
    test.use({
      mswHandlers: [
        [
          fvae.query(
            "activeFeaturesForConnectedUser",
            graphQLResolver({
              activeFeaturesForConnectedUser: [],
            }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("redirige vers la page d'inscription au clic sur « Créer mon compte »", async ({
      page,
    }) => {
      await login(page, { authenticated: false });

      await page.getByRole("link", { name: "Créer mon compte" }).click();

      await expect(
        page.getByRole("heading", { name: "Création de compte" }),
      ).toBeVisible();
    });

    test("affiche uniquement le formulaire de connexion par mot de passe sans titre", async ({
      page,
    }) => {
      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Se connecter avec mot de passe" }),
      ).not.toBeVisible();
      await expect(page.getByLabel("Identifiant")).toBeVisible();
      await expect(page.getByLabel("Mot de passe")).toBeVisible();
    });
  });
});
