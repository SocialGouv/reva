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
    waitGraphQL(page, "getUserAccountForUpdateUserAccountPage"),
  ]);
}

const updateUserAccountInformationConnexionHandlers = () => {
  const getUserAccountForUpdateUserAccountPageHandler = fvae.query(
    "getUserAccountForUpdateUserAccountPage",
    graphQLResolver({
      organism_getCompteCollaborateurById: {
        id: "account-1",
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
      },
    }),
  );

  const updateUserAccountForUpdateUserAccountPageHandler = fvae.mutation(
    "updateUserAccountForUpdateUserAccountPage",
    graphQLResolver({
      organism_updateAccountAndOrganism: {
        id: "account-1",
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
      },
    }),
  );

  return [
    getUserAccountForUpdateUserAccountPageHandler,
    updateUserAccountForUpdateUserAccountPageHandler,
  ];
};

test.describe("Settings update user account information connexion", () => {
  test.use({
    mswHandlers: [
      [
        ...updateUserAccountInformationConnexionHandlers(),
        ...aapCommonHandlers,
      ],
      { scope: "test" },
    ],
  });
  test.describe("as a Gestionnaire AAP", () => {
    test.describe("when I access i access the update user account information connexion page", () => {
      test("it shows the correct title and all the form fields are filled with the correct values", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/informations-connexion/",
        );
        await waitForPageQueries(page);

        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          "Informations de connexion",
        );
        await expect(
          page.getByTestId("lastname-input").locator("input"),
        ).toHaveValue("Doe");
        await expect(
          page.getByTestId("firstname-input").locator("input"),
        ).toHaveValue("John");
        await expect(
          page.getByTestId("email-input").locator("input"),
        ).toHaveValue("john.doe@example.com");
      });

      test("it let me go back to the user account page", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/informations-connexion/",
        );
        await waitForPageQueries(page);
        await page
          .getByRole("button", { name: "Retour à la page précédente" })
          .click();

        await expect(page).toHaveURL(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/",
        );
      });

      test("it shows an error when i try to submit the form with empty fields", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/informations-connexion/",
        );
        await waitForPageQueries(page);

        await page.getByTestId("lastname-input").locator("input").clear();
        await page.getByTestId("firstname-input").locator("input").clear();
        await page.getByTestId("email-input").locator("input").clear();

        await page.getByRole("button", { name: "Enregistrer" }).click();

        await expect(page.getByTestId("lastname-input")).toHaveClass(
          /fr-input-group--error/,
        );
        await expect(page.getByTestId("firstname-input")).toHaveClass(
          /fr-input-group--error/,
        );
        await expect(page.getByTestId("email-input")).toHaveClass(
          /fr-input-group--error/,
        );

        await expect(page).toHaveURL(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/informations-connexion/",
        );
      });

      test("it let me submit a valid form", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/informations-connexion/",
        );
        await waitForPageQueries(page);

        await page.getByTestId("lastname-input").locator("input").fill("Doe1");
        await page
          .getByTestId("firstname-input")
          .locator("input")
          .fill("John1");
        await page
          .getByTestId("email-input")
          .locator("input")
          .fill("john1.doe1@example.com");
        await page.getByRole("button", { name: "Enregistrer" }).click();

        const mutationPromise = waitGraphQL(
          page,
          "updateUserAccountForUpdateUserAccountPage",
        );

        await page.getByRole("button", { name: "Enregistrer" }).click();

        await mutationPromise;

        await expect(page).toHaveURL(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/informations-connexion/",
        );
      });
    });
    test.describe("when I use the breadcrumb", () => {
      test("it let me go back to the user account page", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/informations-connexion/",
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
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/informations-connexion/",
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
