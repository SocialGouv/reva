import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const { aapCommonHandlers } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getAccountInfo"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(page, "getUserAccountForPositionnementPage"),
  ]);
}

const updateUserAccountPositionnementHandlers = () => {
  const getUserAccountForPositionnementPageHandler = fvae.query(
    "getUserAccountForPositionnementPage",
    graphQLResolver({
      organism_getCompteCollaborateurById: {
        id: "account-1",
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
      },
    }),
  );

  return [getUserAccountForPositionnementPageHandler];
};

test.describe("Settings update user account positionnement", () => {
  test.use({
    mswHandlers: [
      [...updateUserAccountPositionnementHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });
  test.describe("as a Gestionnaire AAP", () => {
    test.describe("when I access i access the update user account positionnement page", () => {
      test("it shows the correct title", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/positionnement/",
        );
        await waitForPageQueries(page);

        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          "Positionnement",
        );
      });

      test("it let me go back to the user account page", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/positionnement/",
        );
        await waitForPageQueries(page);
        await page.getByRole("link", { name: "Retour" }).click();

        await expect(page).toHaveURL(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/",
        );
      });
    });
    test.describe("when I use the breadcrumb", () => {
      test("it let me go back to the user account page", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/positionnement/",
        );
        await waitForPageQueries(page);
        await page.getByRole("link", { name: "Doe John" }).click();
        await expect(page).toHaveURL(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/",
        );
      });
      test("it let me go back to the root settings page", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/positionnement/",
        );
        await waitForPageQueries(page);
        await page
          .locator(".fr-breadcrumb")
          .getByRole("link", { name: "Paramètres" })
          .click();
        await expect(page).toHaveURL("/admin2/agencies-settings-v3/");
      });
    });
  });
});
