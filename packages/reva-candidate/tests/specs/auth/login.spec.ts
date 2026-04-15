import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

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

    test("affiche les deux méthodes de connexion", async ({ page }) => {
      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Se connecter avec un lien" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Se connecter avec mot de passe" }),
      ).toBeVisible();
    });

    test("n'affiche pas le bandeau d'information", async ({ page }) => {
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

    test("redirige vers la page de confirmation après une demande de lien magique", async ({
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

    test("redirige vers la page d'inscription au clic sur « Créer mon compte »", async ({
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

    test("masque le formulaire de connexion par lien magique", async ({
      page,
    }) => {
      await login(page, { authenticated: false });

      await expect(
        page.getByRole("heading", { name: "Connexion candidat" }),
      ).toBeVisible();

      await expect(
        page.getByRole("heading", { name: "Se connecter avec un lien" }),
      ).not.toBeVisible();
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

    test("affiche le bandeau d'information avec les instructions de mot de passe", async ({
      page,
    }) => {
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
