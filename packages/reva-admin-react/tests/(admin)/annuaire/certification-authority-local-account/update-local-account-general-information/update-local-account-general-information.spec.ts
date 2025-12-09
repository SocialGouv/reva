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

function createUpdateLocalAccountGeneralInformationHandlers() {
  return [
    fvae.query(
      "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
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
            id: "c7399291-e79b-4e0f-b798-d3c97661e47f",
            label: "Certification Authority",
          },
        },
      }),
    ),
    fvae.mutation(
      "updateCertificationAuthorityLocalAccountGeneralInformationForUpdateLocalAccountGeneralInformationPage",
      graphQLResolver({
        certification_authority_updateCertificationAuthorityLocalAccount: {
          id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
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
      "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
    ),
  ]);
}

test.describe("main page", () => {
  test.use({
    mswHandlers: [
      [
        ...createUpdateLocalAccountGeneralInformationHandlers(),
        ...aapCommonHandlers,
      ],
      { scope: "test" },
    ],
  });

  test.describe("when i access the update local account general information page", () => {
    test("display the page with a correct title", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/informations-generales/",
      );
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId(
            "update-certification-authority-local-account-general-information-page",
          )
          .locator("h1", { hasText: "Informations générales" }),
      ).toBeVisible();
    });

    test("display the correct form default values", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/informations-generales/",
      );
      await waitForPageQueries(page);

      const pageElement = page.getByTestId(
        "update-certification-authority-local-account-general-information-page",
      );

      await expect(
        pageElement
          .getByTestId("certification-authority-label-input")
          .locator("input"),
      ).toHaveValue("Certification Authority");

      await expect(
        pageElement.getByTestId("account-lastname-input").locator("input"),
      ).toHaveValue("doe");

      await expect(
        pageElement.getByTestId("account-firstname-input").locator("input"),
      ).toHaveValue("jane");

      await expect(
        pageElement.getByTestId("account-email-input").locator("input"),
      ).toHaveValue("monemail@example.com");

      await expect(
        pageElement.getByTestId("contact-full-name-input").locator("input"),
      ).toHaveValue("contact full name");

      await expect(
        pageElement.getByTestId("contact-email-input").locator("input"),
      ).toHaveValue("contact@example.com");

      await expect(
        pageElement.getByTestId("contact-phone-input").locator("input"),
      ).toHaveValue("0123456789");
    });

    test("do not let me click on the submit button if there is no changes", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/informations-generales/",
      );
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId(
            "update-certification-authority-local-account-general-information-page",
          )
          .locator("button[type='submit']"),
      ).toBeDisabled();
    });

    test("let me change the contact fields and submit the form", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/informations-generales/",
      );
      await waitForPageQueries(page);

      const pageElement = page.getByTestId(
        "update-certification-authority-local-account-general-information-page",
      );

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
        "updateCertificationAuthorityLocalAccountGeneralInformationForUpdateLocalAccountGeneralInformationPage",
      );

      await pageElement.locator("button[type='submit']").click();

      await mutationPromise;

      await expect(page).toHaveURL(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/",
      );
    });
  });
});
