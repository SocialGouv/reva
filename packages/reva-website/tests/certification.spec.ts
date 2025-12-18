import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import certificationBtsChaudronnierData from "./fixtures/certifications/chaudronnier.json";
import articlesForCertificationPageUsefulResources from "./fixtures/strapi/articlesForCertificationPageUsefulResources.json";

const fvae = graphql.link("https://reva-api/api/graphql");
const strapi = graphql.link("https://strapi.vae.gouv.fr/graphql");

const chaudronnier = certificationBtsChaudronnierData.data.getCertification;

test.use({
  mswHandlers: [
    [
      fvae.query("activeFeaturesForConnectedUser", () => {
        return HttpResponse.json({
          data: {
            activeFeaturesForConnectedUser: ["WEBSITE_CERTIFICATION_PAGE_V2"],
          },
        });
      }),
      fvae.query("getCertificationForCertificationPage", () => {
        return HttpResponse.json(certificationBtsChaudronnierData);
      }),
      strapi.query("getArticlesForCertificationPageUsefulResources", () => {
        return HttpResponse.json(articlesForCertificationPageUsefulResources);
      }),
    ],
    { scope: "test" },
  ],
});

test("display certification page with correct data info", async ({ page }) => {
  await page.goto("/certifications/610b6e86-9435-4781-abda-4cad3a746f32/");
  await expect(page.getByTestId("certification-label")).toHaveText(
    chaudronnier.label,
  );
});

test("display certification authority structure label", async ({ page }) => {
  await page.goto("/certifications/610b6e86-9435-4781-abda-4cad3a746f32/");
  const heading = page.getByRole("heading", { name: chaudronnier.label });
  await expect(heading.locator("+ p")).toHaveText(
    chaudronnier.certificationAuthorityStructure.label,
  );
});

test("display level tile with diploma type", async ({ page }) => {
  await page.goto("/certifications/610b6e86-9435-4781-abda-4cad3a746f32/");
  const levelTile = page.getByRole("heading", {
    name: `Niveau ${chaudronnier.level}`,
  });
  await expect(levelTile).toBeVisible();
  await expect(
    levelTile.locator("..").getByText(chaudronnier.typeDiplome),
  ).toBeVisible();
});

test("display expiration date tile", async ({ page }) => {
  await page.goto("/certifications/610b6e86-9435-4781-abda-4cad3a746f32/");
  const expirationTile = page.getByRole("heading", {
    name: "Date d'expiration",
  });
  await expect(expirationTile).toBeVisible();
  const expectedDate = new Date(chaudronnier.rncpExpiresAt).toLocaleDateString(
    "fr-FR",
  );
  await expect(
    expirationTile.locator("..").getByText(expectedDate),
  ).toBeVisible();
});

test("should not display VAE collective button when feature flag is disabled", async ({
  page,
}) => {
  await page.goto("/certifications/610b6e86-9435-4781-abda-4cad3a746f32/");
  await expect(
    page.getByRole("link", { name: "Utiliser un code VAE collective" }),
  ).not.toBeVisible();
});

test.describe("VAE collective button - with feature flag enabled", () => {
  test.use({
    mswHandlers: [
      [
        fvae.query("activeFeaturesForConnectedUser", () => {
          return HttpResponse.json({
            data: {
              activeFeaturesForConnectedUser: [
                "WEBSITE_CERTIFICATION_PAGE_V2",
                "VAE_COLLECTIVE",
              ],
            },
          });
        }),
        fvae.query("getCertificationForCertificationPage", () => {
          return HttpResponse.json(certificationBtsChaudronnierData);
        }),
        strapi.query("getArticlesForCertificationPageUsefulResources", () => {
          return HttpResponse.json(articlesForCertificationPageUsefulResources);
        }),
      ],
      { scope: "test" },
    ],
  });

  test("should display VAE collective button when feature flag is enabled", async ({
    page,
  }) => {
    await page.goto("/certifications/610b6e86-9435-4781-abda-4cad3a746f32/");
    const vaeCollectiveButton = page.getByRole("link", {
      name: "Utiliser un code VAE collective",
    });
    await expect(vaeCollectiveButton).toBeVisible();
  });

  test("should navigate to VAE collective page when button is clicked", async ({
    page,
  }) => {
    await page.goto("/certifications/610b6e86-9435-4781-abda-4cad3a746f32/");
    const vaeCollectiveButton = page.getByRole("link", {
      name: "Utiliser un code VAE collective",
    });
    await vaeCollectiveButton.click();

    await expect(page).toHaveURL("/inscription-candidat/vae-collective/");
  });
});
