import { expect, test } from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import { setupKeycloakUnauthenticated } from "@tests/helpers/auth/auth";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const handlers = [
  fvae.query(
    "activeFeaturesForConnectedUser",
    graphQLResolver({ activeFeaturesForConnectedUser: [] }),
  ),
];

async function navigateToRegisterPage(page: import("@playwright/test").Page) {
  await setupKeycloakUnauthenticated(page);
  await page.goto("register");
}

test.describe("Register page", () => {
  test.use({ mswHandlers: [handlers, { scope: "test" }] });

  test("shows registration form with login link and public agents warning", async ({
    page,
  }) => {
    await navigateToRegisterPage(page);

    await expect(
      page.getByRole("heading", { name: "Création de compte" }),
    ).toBeVisible();
    await expect(page.getByLabel("Identifiant")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "S'inscrire" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Se connecter" }),
    ).toBeVisible();
    await expect(
      page.getByText(/France VAE n'est pas encore disponible pour les/),
    ).toBeVisible();
  });

  test("navigates to login page when clicking connect", async ({ page }) => {
    await navigateToRegisterPage(page);

    await page.getByRole("link", { name: "Se connecter" }).click();

    await expect(
      page.getByRole("heading", { name: "Connexion candidat" }),
    ).toBeVisible();
  });

  test("redirects to confirmation page after successful registration", async ({
    page,
    msw,
  }) => {
    msw.use(
      fvae.mutation(
        "candidate_askForRegistrationWithPassword",
        graphQLResolver({ candidate_askForRegistrationWithPassword: "OK" }),
      ),
    );

    await navigateToRegisterPage(page);

    await page.getByLabel("Identifiant").fill("newuser@example.com");

    const mutationPromise = waitGraphQL(
      page,
      "candidate_askForRegistrationWithPassword",
    );

    await page.getByRole("button", { name: "S'inscrire" }).click();
    await mutationPromise;

    await expect(
      page.getByRole("heading", {
        name: "Dernière étape, activez votre compte !",
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Votre demande de création de compte a bien été enregistrée.",
      ),
    ).toBeVisible();
  });
});
