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

function createUpdateLocalAccountInterventionAreaHandlers() {
  return [
    fvae.query(
      "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
      graphQLResolver({
        certification_authority_getCertificationAuthorityLocalAccount: {
          id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
          account: {
            firstname: "jane",
            lastname: "doe",
            email: "monemail@example.com",
          },
          contactFullName: "contact full name",
          contactEmail: "contact@example.com",
          contactPhone: "0123456789",
          certificationAuthority: {
            label: "Certification Authority",
            departments: [
              {
                id: "0fd699b6-40c2-4ded-a29c-3417cded8b58",
                code: "01",
                label: "Ain",
                region: {
                  id: "2946d835-f0fa-4c37-9a50-0735112395bd",
                  label: "Auvergne-Rhône-Alpes",
                },
              },
              {
                id: "296bce2a-9bc3-4915-ad61-e666868c4d82",
                code: "26",
                label: "Drôme",
                region: {
                  id: "2946d835-f0fa-4c37-9a50-0735112395bd",
                  label: "Auvergne-Rhône-Alpes",
                },
              },
              {
                id: "ec234db7-2a3b-46f4-9514-fedee4f4f1ca",
                code: "69",
                label: "Rhône",
                region: {
                  id: "2946d835-f0fa-4c37-9a50-0735112395bd",
                  label: "Auvergne-Rhône-Alpes",
                },
              },
              {
                id: "9d89aab8-c0d3-4965-ac32-3e035ba7370b",
                code: "73",
                label: "Savoie",
                region: {
                  id: "2946d835-f0fa-4c37-9a50-0735112395bd",
                  label: "Auvergne-Rhône-Alpes",
                },
              },
              {
                id: "ceb64010-79ff-44c1-b45f-277ef726314c",
                code: "44",
                label: "Loire-Atlantique",
                region: {
                  id: "466c5805-c297-4c6a-9ba7-62a0889a6b71",
                  label: "Pays de la Loire",
                },
              },
              {
                id: "01bae087-8ca0-4fab-9ffe-fd8aec53129f",
                code: "85",
                label: "Vendée",
                region: {
                  id: "466c5805-c297-4c6a-9ba7-62a0889a6b71",
                  label: "Pays de la Loire",
                },
              },
            ],
          },
          departments: [
            {
              id: "ec234db7-2a3b-46f4-9514-fedee4f4f1ca",
              code: "69",
              label: "Rhône",
            },
            {
              id: "0fd699b6-40c2-4ded-a29c-3417cded8b58",
              code: "01",
              label: "Ain",
            },
          ],
        },
        certification_authority_getCertificationAuthorityStructure: {
          id: "e8f214f1-3243-4dc6-8fe0-205d4cafd9d1",
          label: "myStructure",
        },
      }),
    ),
    fvae.mutation(
      "updateCertificationAuthorityLocalAccountDepartmentsForAdminUpdateLocalAccountInterventionAreaPage",
      graphQLResolver({
        certification_authority_updateCertificationAuthorityLocalAccountDepartments:
          {
            id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
            departments: [
              {
                id: "ec234db7-2a3b-46f4-9514-fedee4f4f1ca",
                code: "69",
                label: "Rhône",
              },
              {
                id: "0fd699b6-40c2-4ded-a29c-3417cded8b58",
                code: "01",
                label: "Ain",
              },
              {
                id: "ceb64010-79ff-44c1-b45f-277ef726314c",
                code: "44",
                label: "Loire-Atlantique",
              },
            ],
          },
      }),
    ),
  ];
}

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(
      page,
      "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
    ),
  ]);
}

test.describe("main page", () => {
  test.use({
    mswHandlers: [
      [
        ...createUpdateLocalAccountInterventionAreaHandlers(),
        ...aapCommonHandlers,
      ],
      { scope: "test" },
    ],
  });

  test.describe("when i access the update local account intervention area page", () => {
    test("display the page with a correct title", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/zone-intervention/",
      );
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId(
            "update-certification-authority-local-account-intervention-area-page",
          )
          .locator("h1", { hasText: "Zone d’intervention" }),
      ).toBeVisible();
    });

    test("display the correct form default values", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/zone-intervention/",
      );
      await waitForPageQueries(page);

      const pageElement = page.getByTestId(
        "update-certification-authority-local-account-intervention-area-page",
      );

      await expect(
        pageElement
          .getByTestId("tree-select-item-Auvergne-Rhône-Alpes")
          .locator("div")
          .first(),
      ).toContainClass("checkbox-partial");

      await expect(
        pageElement.getByTestId("tree-select-item-Ain (01)").locator("input"),
      ).toBeChecked();

      await expect(
        pageElement.getByTestId("tree-select-item-Rhône (69)").locator("input"),
      ).toBeChecked();
    });

    test("do not let me click on the submit button if there is no changes", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/zone-intervention/",
      );
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId(
            "update-certification-authority-local-account-intervention-area-page",
          )
          .getByRole("button", { name: "Enregistrer" }),
      ).toBeDisabled();
    });

    test("let me update the departments and submit the form", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/zone-intervention/",
      );
      await waitForPageQueries(page);

      const pageElement = page.getByTestId(
        "update-certification-authority-local-account-intervention-area-page",
      );

      await pageElement
        .getByTestId("tree-select-item-Pays de la Loire")
        .click();

      await pageElement
        .getByTestId("tree-select-item-Loire-Atlantique (44)")
        .click();

      const mutationPromise = waitGraphQL(
        page,
        "updateCertificationAuthorityLocalAccountDepartmentsForAdminUpdateLocalAccountInterventionAreaPage",
      );

      await pageElement.locator("button[type='submit']").click();

      await mutationPromise;

      await await expect(page).toHaveURL(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/",
      );
    });
  });
});
