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
    waitGraphQL(page, "getOrganismForAAPVisibilityCheck"),
    waitGraphQL(page, "getAccountInfo"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(page, "getMaisonMerAAPUserAccounts"),
  ]);
}

const createUserAccountV2Handlers = () => {
  const getGestionnaireMaisonMereAAPSettingsInfoHandler = fvae.query(
    "getMaisonMerAAPUserAccounts",
    graphQLResolver({
      organism_getMaisonMereAAPById: {
        id: "a8e32301-86b8-414b-8b55-af86d289adee",
        organisms: [
          {
            id: "8475dff5-1c9b-4fb3-a8d9-93ada523d165",
            accounts: [
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
        ],
      },
    }),
  );

  return [getGestionnaireMaisonMereAAPSettingsInfoHandler];
};

test.describe("Settings User accounts v2", () => {
  test.use({
    mswHandlers: [
      [...createUserAccountV2Handlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });
  test.describe("as a Gestionnaire AAP", () => {
    test.describe("when I access the user accounts v2 page for a user account", () => {
      test("it shows the correct title", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-2/",
        );
        await waitForPageQueries(page);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          "Doe John",
        );
      });

      test("it let me go back to the settings page", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-2/",
        );
        await waitForPageQueries(page);
        await page
          .getByRole("link", { name: "Retour aux collaborateurs" })
          .click();
        await expect(page).toHaveURL("/admin2/agencies-settings-v3/");
      });

      test("it let me go to the connexion information page when I click on the 'Informations de connexion' card", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-2/",
        );
        await waitForPageQueries(page);
        await page
          .getByTestId("informations-connexion-card")
          .getByRole("button", { name: "Modifier" })
          .click();
        await expect(page).toHaveURL(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-2/informations-connexion/",
        );
      });

      test("it let me go to the positionnement page when I click on the 'Positionnement' card", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-2/",
        );
        await waitForPageQueries(page);
        await page
          .getByTestId("positionnement-card")
          .getByRole("button", { name: "Modifier" })
          .click();
        await expect(page).toHaveURL(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-2/positionnement/",
        );
      });
    });
  });
});
