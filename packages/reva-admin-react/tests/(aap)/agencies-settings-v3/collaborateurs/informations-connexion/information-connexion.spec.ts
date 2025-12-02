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
    waitGraphQL(
      page,
      "getUserAccountForCollaborateurInformationsConnexionPage",
    ),
  ]);
}

const informationsConnexionHandlers = () => {
  const getUserAccountForCollaborateurInformationsConnexionPageHandler =
    fvae.query(
      "getUserAccountForCollaborateurInformationsConnexionPage",
      graphQLResolver({
        organism_getCompteCollaborateurById: {
          id: "account-1",
          firstname: "John",
          lastname: "Doe",
          email: "john.doe@example.com",
        },
      }),
    );

  return [getUserAccountForCollaborateurInformationsConnexionPageHandler];
};

test.describe("Collaborateur informations connexion page", () => {
  test.use({
    mswHandlers: [
      [...informationsConnexionHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test.describe("as an AAP collaborateur", () => {
    test.describe("when I access i access the settings information connexion page", () => {
      test("it shows the correct title and all the form fields are filled with the correct values", async ({
        page,
      }) => {
        await login({ role: "aapCollaborateur", page });
        await page.goto(
          "/admin2/agencies-settings-v3/collaborateurs/account-1/informations-connexion/",
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
        await login({ role: "aapCollaborateur", page });
        await page.goto(
          "/admin2/agencies-settings-v3/collaborateurs/account-1/informations-connexion/",
        );
        await waitForPageQueries(page);
        await page
          .getByRole("button", { name: "Retour à la page précédente" })
          .click();

        await expect(page).toHaveURL(
          "/admin2/agencies-settings-v3/collaborateurs/account-1/",
        );
      });

      test.describe("when I use the breadcrumb", () => {
        test("it let me go back to the collaborateur settings page", async ({
          page,
        }) => {
          await login({ role: "aapCollaborateur", page });
          await page.goto(
            "/admin2/agencies-settings-v3/collaborateurs/account-1/informations-connexion/",
          );
          await waitForPageQueries(page);
          await page
            .locator(".fr-breadcrumb")
            .getByRole("link", { name: "Paramètres" })
            .click();
          await expect(page).toHaveURL(
            "/admin2/agencies-settings-v3/collaborateurs/account-1/",
          );
        });
      });
    });
  });
});
