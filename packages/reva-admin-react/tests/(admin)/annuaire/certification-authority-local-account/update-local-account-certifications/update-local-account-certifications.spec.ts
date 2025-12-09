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

function createUpdateLocalAccountCertificationsHandlers() {
  return [
    fvae.query(
      "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountCertificationsPage",
      graphQLResolver({
        certification_authority_getCertificationAuthorityLocalAccount: {
          id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
          account: {
            firstname: "jane",
            lastname: "doe",
            email: "monemail@example.com",
          },
          certificationAuthority: {
            label: "Certification Authority",
            certifications: [
              {
                id: "00fa1e5b-1535-4cb6-b542-0dad27dd6341",
                label:
                  "CQP Animateur d'équipe autonome de production industrielle",
                codeRncp: "37310",
              },
              {
                id: "0236bf82-e85d-4e88-927a-c93bb6c44efb",
                label:
                  "Diplôme d'Etat Conseiller en économie sociale et familiale - DEESF",
                codeRncp: "49872",
              },
              {
                id: "032036b5-528e-4d06-bbe0-a7d180602bc1",
                label: "Titre professionnel Cariste d'entrepôt - CE ",
                codeRncp: "13247",
              },
            ],
          },
          certifications: [
            {
              id: "0236bf82-e85d-4e88-927a-c93bb6c44efb",
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
      "updateCertificationAuthorityLocalAccountCertificationsForAdminUpdateLocalAccountCertificationsPage",
      graphQLResolver({
        certification_authority_updateCertificationAuthorityLocalAccountCertifications:
          {
            id: "b4e996de-be53-4d1d-b8fb-879b9e75d450",
            certifications: [
              {
                id: "7c4ce27e-b0ac-4c95-92aa-476c913adf5c",
                label: "BTS Fonderie",
                codeRncp: "37310",
              },
              {
                id: "7ad608c2-5a4b-40eb-8ef9-7a85421b40f0",
                label: "BTS Pilotage de procédés - PP",
                codeRncp: "50410",
              },
              {
                id: "dcee4c57-e7fe-47a9-bdb2-ec479880cfdf",
                label:
                  "Titre à finalité professionnelle Conducteur accompagnateur de personnes à mobilité réduite - CAPMR",
                codeRncp: "48781",
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
      "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountCertificationsPage",
    ),
  ]);
}

test.describe("main page", () => {
  test.use({
    mswHandlers: [
      [
        ...createUpdateLocalAccountCertificationsHandlers(),
        ...aapCommonHandlers,
      ],
      { scope: "test" },
    ],
  });

  test.describe("when i access the update local account certifications page", () => {
    test("display the page with a correct title", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/certifications",
      );
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId(
            "update-certification-authority-local-account-certifications-page",
          )
          .locator("h1", { hasText: "Certifications gérées" }),
      ).toBeVisible();
    });

    test("display the correct form default values", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/certifications",
      );
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId(
            "tree-select-item-37310 - CQP Animateur d'équipe autonome de production industrielle",
          )
          .locator("input"),
      ).not.toBeChecked();

      await expect(
        page
          .getByTestId(
            "tree-select-item-49872 - Diplôme d'Etat Conseiller en économie sociale et familiale - DEESF",
          )
          .locator("input"),
      ).toBeChecked();
    });

    test("do not let me click on the submit button if there is no changes", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/certifications",
      );
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId(
            "update-certification-authority-local-account-certifications-page",
          )
          .locator("button[type='submit']"),
      ).toBeDisabled();
    });

    test("let me update the certifications and submit the form", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/certifications",
      );
      await waitForPageQueries(page);

      await page
        .getByTestId(
          "tree-select-item-37310 - CQP Animateur d'équipe autonome de production industrielle",
        )
        .locator("input")
        .check({ force: true });

      const mutationPromise = waitGraphQL(
        page,
        "updateCertificationAuthorityLocalAccountCertificationsForAdminUpdateLocalAccountCertificationsPage",
      );

      await page
        .getByTestId(
          "update-certification-authority-local-account-certifications-page",
        )
        .locator("button[type='submit']")
        .click();

      await mutationPromise;

      await expect(page).toHaveURL(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/",
      );
    });
  });
});
