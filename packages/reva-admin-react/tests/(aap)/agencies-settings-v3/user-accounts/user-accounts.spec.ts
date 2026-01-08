import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../shared/helpers/network/requests";

const { aapCommonHandlers } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getAccountInfo"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(page, "getMaisonMerAAPUserAccounts"),
  ]);
}

const createUserAccountHandlers = () => {
  const getGestionnaireMaisonMereAAPSettingsInfoHandler = fvae.query(
    "getMaisonMerAAPUserAccounts",
    graphQLResolver({
      organism_getMaisonMereAAPById: {
        id: "a8e32301-86b8-414b-8b55-af86d289adee",
        comptesCollaborateurs: [
          {
            id: "account-2",
            firstname: "John",
            lastname: "Doe",
            organisms: [
              {
                id: "8475dff5-1c9b-4fb3-a8d9-93ada523d165",
              },
            ],
          },
        ],
      },
    }),
  );

  const disableCompteCollaborateurForDisableCompteCollaborateurAAPTile =
    fvae.mutation(
      "disableCompteCollaborateurForDisableCompteCollaborateurAAPTile",
      graphQLResolver({
        organism_disableCompteCollaborateur: {},
      }),
    );
  return [
    getGestionnaireMaisonMereAAPSettingsInfoHandler,
    disableCompteCollaborateurForDisableCompteCollaborateurAAPTile,
  ];
};

test.describe("Settings User accounts", () => {
  test.use({
    mswHandlers: [
      [...createUserAccountHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  [
    {
      label: "As a Gestionnaire AAP",
      role: "aap" as const,
      backUrl: "/admin2/agencies-settings-v3/",
      rootBreadCrumbLabel: "Paramètres",
      rootBreadCrumbUrl: "/admin2/agencies-settings-v3/",
    },
    {
      label: "As an Admin",
      role: "admin" as const,
      backUrl: "/admin2/maison-mere-aap/a8e32301-86b8-414b-8b55-af86d289adee/",
      rootBreadCrumbLabel: "Structure accompagnatrice",
      rootBreadCrumbUrl:
        "/admin2/maison-mere-aap/a8e32301-86b8-414b-8b55-af86d289adee/",
    },
  ].forEach(
    ({ role, label, backUrl, rootBreadCrumbLabel, rootBreadCrumbUrl }) => {
      test.describe(label, () => {
        test.describe("when I access the user accounts page for a user account", () => {
          test("it shows the correct title", async ({ page }) => {
            await login({ role, page });
            await page.goto(
              "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts/account-2/",
            );
            await waitForPageQueries(page);
            await expect(page.getByRole("heading", { level: 1 })).toHaveText(
              "Doe John",
            );
          });

          test("it let me go back to the settings page", async ({ page }) => {
            await login({ role, page });
            await page.goto(
              "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts/account-2/",
            );
            await waitForPageQueries(page);
            await page.getByRole("link", { name: "Retour" }).click();
            await expect(page).toHaveURL(backUrl);
          });

          test("it let me go to the connexion information page when I click on the 'Informations de connexion' card", async ({
            page,
          }) => {
            await login({ role, page });
            await page.goto(
              "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts/account-2/",
            );
            await waitForPageQueries(page);
            await page
              .getByTestId("informations-connexion-card")
              .getByRole("button", { name: "Modifier" })
              .click();
            await expect(page).toHaveURL(
              "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts/account-2/informations-connexion/",
            );
          });

          test("it let me go to the positionnement page when I click on the 'Positionnement' card", async ({
            page,
          }) => {
            await login({ role, page });
            await page.goto(
              "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts/account-2/",
            );
            await waitForPageQueries(page);
            await page
              .getByTestId("positionnement-card")
              .getByRole("button", { name: "Modifier" })
              .click();
            await expect(page).toHaveURL(
              "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts/account-2/positionnement/",
            );
          });
        });
        test.describe("when I use the breadcrumb", () => {
          test("it let me go back to the root page of the breadcrumb", async ({
            page,
          }) => {
            await login({ role, page });
            await page.goto(
              "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts/account-2/",
            );
            await waitForPageQueries(page);
            await page
              .locator(".fr-breadcrumb")
              .getByRole("link", { name: rootBreadCrumbLabel })
              .click();
            await expect(page).toHaveURL(rootBreadCrumbUrl);
          });
        });

        test.describe("when I use the disable user account tile", () => {
          test("it let me click on the tile and cancel the action", async ({
            page,
          }) => {
            await login({ role, page });
            await page.goto(
              "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts/account-2/",
            );
            await waitForPageQueries(page);
            await page.getByText("Désactiver le compte collaborateur").click();
            await expect(
              page.getByRole("dialog", {
                name: "Voulez-vous désactiver ce compte collaborateur ?",
              }),
            ).toBeVisible();
            await page.getByRole("button", { name: "Annuler" }).click();
            await expect(
              page.getByRole("dialog", {
                name: "Voulez-vous désactiver ce compte collaborateur ?",
              }),
            ).not.toBeVisible();
          });

          test("it let me click on the tile and confirm the action", async ({
            page,
          }) => {
            await login({ role, page });
            await page.goto(
              "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts/account-2/",
            );
            await waitForPageQueries(page);
            await page.getByText("Désactiver le compte collaborateur").click();
            await expect(
              page.getByRole("dialog", {
                name: "Voulez-vous désactiver ce compte collaborateur ?",
              }),
            ).toBeVisible();
            const mutationPromise = waitGraphQL(
              page,
              "disableCompteCollaborateurForDisableCompteCollaborateurAAPTile",
            );
            await page
              .getByRole("button", { name: "Désactiver", exact: true })
              .click();
            await mutationPromise;
            await expect(page).toHaveURL(backUrl);
          });
        });
      });
    },
  );
});
