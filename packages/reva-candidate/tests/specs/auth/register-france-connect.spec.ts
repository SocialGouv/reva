import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { setupKeycloakUnauthenticated } from "@tests/helpers/auth/auth";
import {
  FRANCE_CONNECT_AUTHORIZE_PATH,
  FRANCE_CONNECT_BUTTON_NAME,
  FRANCE_CONNECT_FF,
} from "@tests/helpers/auth/france-connect";
import { graphQLResolver } from "@tests/helpers/network/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

const handlers = [
  fvae.query(
    "activeFeaturesForConnectedUser",
    graphQLResolver({
      activeFeaturesForConnectedUser: [FRANCE_CONNECT_FF],
    }),
  ),
];

test.describe("Page d'inscription - FranceConnect actif", () => {
  test.use({ mswHandlers: [handlers, { scope: "test" }] });

  test("affiche le bouton FranceConnect avec l'URL d'autorisation de l'API", async ({
    page,
  }) => {
    await setupKeycloakUnauthenticated(page);
    await page.goto("register");

    const fcLink = page.getByRole("link", {
      name: FRANCE_CONNECT_BUTTON_NAME,
    });

    await expect(fcLink).toBeVisible();
    const href = await fcLink.getAttribute("href");
    expect(href).toContain(FRANCE_CONNECT_AUTHORIZE_PATH);
  });
});

test.describe("Page d'inscription - FranceConnect inactif", () => {
  const inactiveHandlers = [
    fvae.query(
      "activeFeaturesForConnectedUser",
      graphQLResolver({ activeFeaturesForConnectedUser: [] }),
    ),
  ];

  test.use({ mswHandlers: [inactiveHandlers, { scope: "test" }] });

  test("masque le bouton FranceConnect quand le feature flag est désactivé", async ({
    page,
  }) => {
    await setupKeycloakUnauthenticated(page);
    await page.goto("register");

    await expect(
      page.getByRole("heading", { name: "Création de compte" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: FRANCE_CONNECT_BUTTON_NAME }),
    ).toHaveCount(0);
  });
});
