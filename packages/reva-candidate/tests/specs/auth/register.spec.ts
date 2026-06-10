import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { setupKeycloakUnauthenticated } from "@tests/helpers/auth/auth";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const handlers = [
  fvae.query(
    "activeFeaturesForConnectedUser",
    graphQLResolver({
      activeFeaturesForConnectedUser: [
        "ENABLE_REGISTER_WITH_PASSWORD",
        "FRANCE_CONNECT_AUTH_FOR_CANDIDATE",
      ],
    }),
  ),
];

async function navigateToRegisterWithPasswordPage(
  page: import("@playwright/test").Page,
) {
  await setupKeycloakUnauthenticated(page);
  await page.goto("register-with-password");
}

test.describe("Register with password page", () => {
  test.use({ mswHandlers: [handlers, { scope: "test" }] });

  test("affiche le formulaire d'inscription par mot de passe via l'URL dédiée même quand FranceConnect est actif", async ({
    page,
  }) => {
    await navigateToRegisterWithPasswordPage(page);

    await expect(
      page.getByRole("heading", { name: "Création de compte" }),
    ).toBeVisible();
    await expect(page.getByLabel("Identifiant")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "S'inscrire" }),
    ).toBeVisible();
  });

  test("redirige vers l'inscription standard quand l'inscription par mot de passe est désactivée", async ({
    page,
    msw,
  }) => {
    msw.use(
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser: ["FRANCE_CONNECT_AUTH_FOR_CANDIDATE"],
        }),
      ),
    );

    await setupKeycloakUnauthenticated(page);
    await page.goto("register-with-password");

    await expect(page).toHaveURL("/candidat/register/");
    await expect(
      page.getByRole("heading", { name: "Création de compte" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "S’identifier avec FranceConnect" }),
    ).toBeVisible();
  });

  test("redirige vers la page de confirmation après une inscription réussie", async ({
    page,
    msw,
  }) => {
    msw.use(
      fvae.mutation(
        "candidate_askForRegistrationWithPassword",
        graphQLResolver({ candidate_askForRegistrationWithPassword: "OK" }),
      ),
    );

    await navigateToRegisterWithPasswordPage(page);

    await page.getByLabel("Identifiant").fill("newuser@example.com");

    const mutationPromise = waitGraphQL(
      page,
      "candidate_askForRegistrationWithPassword",
    );

    await page.getByRole("button", { name: "S'inscrire" }).click();
    await mutationPromise;

    await expect(page).toHaveURL(/register-confirmation/);
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
