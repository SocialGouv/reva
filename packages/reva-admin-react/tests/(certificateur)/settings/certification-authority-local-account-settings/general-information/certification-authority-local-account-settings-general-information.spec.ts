import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const CERTIFICATION_AUTHORITY_ID = "c7399291-e79b-4e0f-b798-d3c97661e47f";

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers({
    certificationAuthorityId: CERTIFICATION_AUTHORITY_ID,
  });

const fvae = graphql.link("https://reva-api/api/graphql");

const localAccountForGeneralInfo = graphQLResolver({
  account_getAccountForConnectedUser: {
    certificationAuthorityLocalAccount: {
      id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
      contactFullName: "contact full name",
      contactEmail: "contact.email@example.com",
      contactPhone: "0123456789",
      account: {
        firstname: "jane",
        lastname: "doe",
        email: "monemail@example.com",
      },
      certificationAuthority: {
        label: "DREETS CENTRE VAL DE LOIRE",
      },
    },
  },
});

const updateGeneralInfoMutationResponse = graphQLResolver({
  certification_authority_updateCertificationAuthorityLocalAccountGeneralInformation:
    {
      id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
    },
});

async function gotoGeneralInformationPage(
  page: import("@playwright/test").Page,
) {
  await login({ role: "certificateur", page });
  await page.goto(
    `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-account/general-information`,
  );
  await Promise.all([
    certificateurSettingsCommonWait(page),
    waitGraphQL(
      page,
      "getCertificationAuthorityLocalAccountForGeneralInformationLocalAccountPage",
    ),
  ]);
}

test.describe("local account settings general information page", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForGeneralInformationLocalAccountPage",
          localAccountForGeneralInfo,
        ),
        fvae.mutation(
          "updateCertificationAuthorityLocalAccountGeneralInformationForUpdateLocalAccountGeneralInformationSettingsPage",
          updateGeneralInfoMutationResponse,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the general information page - display the informations générales title and read-only certification authority label", async ({
    page,
  }) => {
    await gotoGeneralInformationPage(page);
    const pageRoot = page.getByTestId("general-information-local-account-page");
    await expect(
      pageRoot.getByRole("heading", {
        level: 1,
        name: "Informations générales",
      }),
    ).toBeVisible();
    await expect(pageRoot).toContainText(
      "Les champs grisés sont gérés par le gestionnaire de candidatures de votre structure",
    );
    const certificationAuthorityInput =
      pageRoot.getByLabel("Gestionnaire de candidatures");
    await expect(certificationAuthorityInput).toHaveValue(
      "DREETS CENTRE VAL DE LOIRE",
    );
    await expect(certificationAuthorityInput).toBeDisabled();
  });

  test("when i access the general information page - display the correct form default values", async ({
    page,
  }) => {
    await gotoGeneralInformationPage(page);
    const pageRoot = page.getByTestId("general-information-local-account-page");
    const accountLastnameInput = pageRoot
      .getByTestId("account-lastname-input")
      .locator("input");
    await expect(accountLastnameInput).toHaveValue("doe");
    await expect(accountLastnameInput).toBeDisabled();
    const accountFirstnameInput = pageRoot
      .getByTestId("account-firstname-input")
      .locator("input");
    await expect(accountFirstnameInput).toHaveValue("jane");
    await expect(accountFirstnameInput).toBeDisabled();
    const accountEmailInput = pageRoot
      .getByTestId("account-email-input")
      .locator("input");
    await expect(accountEmailInput).toHaveValue("monemail@example.com");
    await expect(accountEmailInput).toBeDisabled();
    await expect(
      pageRoot.getByTestId("contact-full-name-input").locator("input"),
    ).toHaveValue("contact full name");
    await expect(
      pageRoot.getByTestId("contact-email-input").locator("input"),
    ).toHaveValue("contact.email@example.com");
    await expect(
      pageRoot.getByTestId("contact-phone-input").locator("input"),
    ).toHaveValue("0123456789");
  });

  test("when i access the general information page - do not let me click on the submit button if there are no changes", async ({
    page,
  }) => {
    await gotoGeneralInformationPage(page);
    await expect(
      page
        .getByTestId("general-information-local-account-page")
        .locator("button[type='submit']"),
    ).toBeDisabled();
  });

  test("when i change the contact fields and submit the form - redirect to the local account settings page", async ({
    page,
  }) => {
    await gotoGeneralInformationPage(page);
    const pageRoot = page.getByTestId("general-information-local-account-page");
    await pageRoot
      .getByTestId("contact-full-name-input")
      .locator("input")
      .fill("new contact full name");
    await pageRoot
      .getByTestId("contact-email-input")
      .locator("input")
      .fill("newcontact.email@example.com");
    await pageRoot
      .getByTestId("contact-phone-input")
      .locator("input")
      .fill("9999999999");

    const mutationPromise = waitGraphQL(
      page,
      "updateCertificationAuthorityLocalAccountGeneralInformationForUpdateLocalAccountGeneralInformationSettingsPage",
    );
    await pageRoot.locator("button[type='submit']").click();
    await mutationPromise;

    await expect(page).toHaveURL(
      new RegExp(
        `/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-account`,
      ),
    );
  });

  test("when i click on the back button - redirect to the local account settings page", async ({
    page,
  }) => {
    await gotoGeneralInformationPage(page);
    await page.getByTestId("back-button").click();
    await expect(page).toHaveURL(
      new RegExp(
        `/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-account`,
      ),
    );
  });

  test.describe("when i use the breadcrumb", () => {
    test("When i click on the 'Paramètres' link it redirects to the local account settings page", async ({
      page,
    }) => {
      await gotoGeneralInformationPage(page);
      await page
        .locator(".fr-breadcrumb")
        .getByRole("link", { name: "Paramètres" })
        .click();
      await expect(page).toHaveURL(
        new RegExp(
          `/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-account`,
        ),
      );
    });
  });
});
