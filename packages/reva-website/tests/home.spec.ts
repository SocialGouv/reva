import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import homePageItems from "./fixtures/strapi/homePageItems.json";

const strapi = graphql.link("https://strapi.vae.gouv.fr/graphql");

test.beforeEach(async ({ page }) => {
  await page.context().addCookies([
    {
      name: "tarteaucitron",
      value: "!matomotm=false!crisp=false",
      path: "/",
      domain: "localhost",
    },
  ]);
});

test.use({
  mswHandlers: [
    [
      strapi.query("getHomePageItems", () => {
        return HttpResponse.json(homePageItems);
      }),
    ],
    { scope: "test" },
  ],
});

test("display home page notice text", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(
    "France VAE | Bienvenue sur le portail de la VAE",
  );
  await expect(page.getByTestId("home-notice-text")).toHaveText(
    "Bienvenue sur Playwright",
  );
});
