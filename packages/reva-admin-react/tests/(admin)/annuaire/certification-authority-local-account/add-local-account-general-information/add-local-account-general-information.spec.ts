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

function createAddLocalAccountGeneralInformationHandlers() {
  return [
    fvae.query(
      "getCertificationAuthorityAndStructureForAdminAddLocalAccountGeneralInformationPage",
      graphQLResolver({
        certification_authority_getCertificationAuthority: {
          id: "c7399291-e79b-4e0f-b798-d3c97661e47f",
          label: "myCertificationAuthority",
        },
        certification_authority_structure_getCertificationAuthorityStructure: {
          id: "e8f214f1-3243-4dc6-8fe0-205d4cafd9d1",
          label: "myStructure",
        },
      }),
    ),
    fvae.mutation(
      "addCertificationAuthorityLocalAccountGeneralInformationForAdminAddLocalAccountGeneralInformationPage",
      graphQLResolver({
        certification_authority_createCertificationAuthorityLocalAccount: {
          id: "f7b5b065-f1c5-47d3-aa0c-c826deee8fa6",
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
      "getCertificationAuthorityAndStructureForAdminAddLocalAccountGeneralInformationPage",
    ),
  ]);
}

test.describe("main page", () => {
  test.use({
    mswHandlers: [
      [
        ...createAddLocalAccountGeneralInformationHandlers(),
        ...aapCommonHandlers,
      ],
      { scope: "test" },
    ],
  });

  test.describe("when i access the add local account general information page", () => {
    test("display the page with a correct title", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter/informations-generales/",
      );
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId(
            "add-certification-authority-local-account-general-information-page",
          )
          .locator("h1", { hasText: "Informations générales" }),
      ).toBeVisible();
    });

    test("let me fill the fields and submit the form", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter/informations-generales/",
      );
      await waitForPageQueries(page);

      const pageElement = page.getByTestId(
        "add-certification-authority-local-account-general-information-page",
      );

      await pageElement
        .getByTestId("account-lastname-input")
        .locator("input")
        .clear();
      await pageElement
        .getByTestId("account-lastname-input")
        .locator("input")
        .type("new account last name");

      await pageElement
        .getByTestId("account-firstname-input")
        .locator("input")
        .clear();
      await pageElement
        .getByTestId("account-firstname-input")
        .locator("input")
        .type("new account first name");

      await pageElement
        .getByTestId("account-email-input")
        .locator("input")
        .clear();
      await pageElement
        .getByTestId("account-email-input")
        .locator("input")
        .type("newaccount.email@example.com");

      await pageElement
        .getByTestId("contact-full-name-input")
        .locator("input")
        .clear();
      await pageElement
        .getByTestId("contact-full-name-input")
        .locator("input")
        .type("new contact full name");

      await pageElement
        .getByTestId("contact-email-input")
        .locator("input")
        .clear();
      await pageElement
        .getByTestId("contact-email-input")
        .locator("input")
        .type("newcontact.email@example.com");

      await pageElement
        .getByTestId("contact-phone-input")
        .locator("input")
        .clear();
      await pageElement
        .getByTestId("contact-phone-input")
        .locator("input")
        .type("9999999999");

      const mutationPromise = waitGraphQL(
        page,
        "addCertificationAuthorityLocalAccountGeneralInformationForAdminAddLocalAccountGeneralInformationPage",
      );
      await pageElement.locator("button[type='submit']").click();

      await mutationPromise;

      await expect(page).toHaveURL(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/f7b5b065-f1c5-47d3-aa0c-c826deee8fa6/",
      );
    });
  });
});
