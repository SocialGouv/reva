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
    waitGraphQL(
      page,
      "getUserAccountAndMaisonMereAAPOrganismsForPositionnementPage",
    ),
  ]);
}

const updateUserAccountPositionnementHandlers = () => {
  const getUserAccountForPositionnementPageHandler = fvae.query(
    "getUserAccountAndMaisonMereAAPOrganismsForPositionnementPage",
    graphQLResolver({
      organism_getMaisonMereAAPById: {
        id: "a8e32301-86b8-414b-8b55-af86d289adee",
        paginatedOrganisms: {
          rows: [
            {
              id: "81c18b2c-fee8-4244-854d-826e6fe56f3f",
              label: "Organism 1",
              adresseNumeroEtNomDeRue: "123 Main St",
              adresseInformationsComplementaires: "Apt 4B",
              adresseCodePostal: "12345",
              adresseVille: "Anytown",
              conformeNormesAccessibilite: true,
              modaliteAccompagnement: "remote",
              disponiblePourVaeCollective: true,
            },
            {
              id: "c31cb1cb-799d-4ffa-a387-1c6c87758415",
              label: "Organism 1",
              adresseNumeroEtNomDeRue: "123 Main St",
              adresseInformationsComplementaires: "Apt 4B",
              adresseCodePostal: "12345",
              adresseVille: "Anytown",
              conformeNormesAccessibilite: true,
              modaliteAccompagnement: "remote",
              disponiblePourVaeCollective: true,
            },
            {
              id: "1657abab-6a9e-42eb-9d15-6f4bf31e980a",
              label: "Organism 1",
              adresseNumeroEtNomDeRue: "123 Main St",
              adresseInformationsComplementaires: "Apt 4B",
              adresseCodePostal: "12345",
              adresseVille: "Anytown",
              conformeNormesAccessibilite: true,
              modaliteAccompagnement: "remote",
              disponiblePourVaeCollective: true,
            },
          ],
          info: {
            totalPages: 1,
          },
        },
      },
      organism_getCompteCollaborateurById: {
        id: "account-1",
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        organisms: [
          {
            id: "c31cb1cb-799d-4ffa-a387-1c6c87758415",
          },
        ],
      },
    }),
  );

  const updateUserAccountPositionnementHandler = fvae.mutation(
    "updateUserAccountPositionnementForPositionnementPage",
    graphQLResolver({
      organism_updatePositionnementCollaborateur: {
        id: "account-1",
      },
    }),
  );

  return [
    getUserAccountForPositionnementPageHandler,
    updateUserAccountPositionnementHandler,
  ];
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

    test.describe("when I use the user account positionnement component", async () => {
      test("it shows the correct organisms list", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/positionnement/",
        );
        await waitForPageQueries(page);

        await expect(
          page
            .getByTestId(
              "multi-select-list-item-81c18b2c-fee8-4244-854d-826e6fe56f3f",
            )
            .getByRole("button", { name: "Ajouter" }),
        ).toBeVisible();
        await expect(
          page
            .getByTestId(
              "multi-select-list-item-c31cb1cb-799d-4ffa-a387-1c6c87758415",
            )
            .getByRole("button", { name: "Retirer" }),
        ).toBeVisible();
        await expect(
          page
            .getByTestId(
              "multi-select-list-item-1657abab-6a9e-42eb-9d15-6f4bf31e980a",
            )
            .getByRole("button", { name: "Ajouter" }),
        ).toBeVisible();
      });

      test("it let me add an organism to the user account positionnement", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/positionnement/",
        );
        await waitForPageQueries(page);

        const mutationPromise = waitGraphQL(
          page,
          "updateUserAccountPositionnementForPositionnementPage",
        );

        await page
          .getByTestId(
            "multi-select-list-item-1657abab-6a9e-42eb-9d15-6f4bf31e980a",
          )
          .getByRole("button", { name: "Ajouter" })
          .click();

        await mutationPromise;
      });

      test("it let me toggle the only show added items switch", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/positionnement/",
        );
        await waitForPageQueries(page);

        const queryPromise = waitGraphQL(
          page,
          "getUserAccountAndMaisonMereAAPOrganismsForPositionnementPage",
        );

        await page
          .getByRole("checkbox", {
            name: "Afficher uniquement les organismes ajoutés",
          })
          .click();

        await queryPromise;
      });

      test("it let me search for an organism", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          "/admin2/agencies-settings-v3/a8e32301-86b8-414b-8b55-af86d289adee/user-accounts-v2/account-1/positionnement/",
        );
        await waitForPageQueries(page);

        const queryPromise = waitGraphQL(
          page,
          "getUserAccountAndMaisonMereAAPOrganismsForPositionnementPage",
        );

        const searchBar = page.getByRole("searchbox", {
          name: "Rechercher par intitulé de l’organisme, code postal ou ville",
        });

        await searchBar.fill("Test Organism");
        await searchBar.press("Enter");

        await queryPromise;
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
