import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import homePageItems from "./fixtures/strapi/homePageItems.json";

const fvae = graphql.link("https://reva-api/api/graphql");
const strapi = graphql.link("https://strapi.vae.gouv.fr/graphql");

test.use({
  mswHandlers: [
    [
      fvae.query("activeFeaturesForConnectedUser", () => {
        return HttpResponse.json({
          data: {
            activeFeaturesForConnectedUser: ["VAE_COLLECTIVE"],
          },
        });
      }),
      strapi.query("getHomePageItems", () => {
        return HttpResponse.json(homePageItems);
      }),
    ],
    { scope: "test" },
  ],
});

test.describe("Commencer une VAE", () => {
  test("should navigate to VAE collective code page from header", async ({
    page,
  }) => {
    await page.goto("/");

    const startButton = page.getByRole("link", { name: "Commencer une VAE" });
    await startButton.click();

    await expect(page).toHaveURL("/commencer/");

    await page
      .getByRole("link", { name: "Je dispose d'un code VAE collective" })
      .click();

    await expect(page).toHaveURL("/inscription-candidat/vae-collective/");
    await expect(
      page.getByRole("heading", { name: "Code VAE collective" }),
    ).toBeVisible();
  });
});
