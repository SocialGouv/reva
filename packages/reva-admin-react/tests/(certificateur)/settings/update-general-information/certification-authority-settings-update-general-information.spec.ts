import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";
import { graphQLResolver } from "../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../shared/helpers/network/requests";

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers();

const fvae = graphql.link("https://reva-api/api/graphql");

const certificationAuthorityGeneralInfo = graphQLResolver({
  account_getAccountForConnectedUser: {
    certificationAuthority: {
      id: "c7399291-e79b-4e0f-b798-d3c97661e47f",
      label: "certification authority label",
      contactFullName: "jane doe",
      contactEmail: "monemail@example.com",
      contactPhone: "0101010101",
      account: {
        firstname: "jane admin",
        lastname: "doe admin",
        email: "monemaildeconnexion@example.com",
      },
    },
  },
});

test.describe("update general information page", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityGeneralInfoForEditPage",
          certificationAuthorityGeneralInfo,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the update general information page - display the page with a correct title", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      "/admin2/certification-authorities/settings/informations-generales",
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(page, "getCertificationAuthorityGeneralInfoForEditPage"),
    ]);

    await expect(
      page.getByTestId("certification-authority-general-info-page-title"),
    ).toHaveText("Informations générales");
  });

  test("when i access the update general information page - display the correct form default values", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      "/admin2/certification-authorities/settings/informations-generales",
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(page, "getCertificationAuthorityGeneralInfoForEditPage"),
    ]);

    await expect(
      page.getByTestId("certification-authority-label").locator("input"),
    ).toHaveValue("certification authority label");
    await expect(
      page
        .getByTestId("certification-authority-account-lastname")
        .locator("input"),
    ).toHaveValue("doe admin");
    await expect(
      page
        .getByTestId("certification-authority-account-firstname")
        .locator("input"),
    ).toHaveValue("jane admin");
    await expect(
      page
        .getByTestId("certification-authority-account-email")
        .locator("input"),
    ).toHaveValue("monemaildeconnexion@example.com");
    await expect(
      page
        .getByTestId("certification-authority-contact-full-name")
        .locator("input"),
    ).toHaveValue("jane doe");
    await expect(
      page
        .getByTestId("certification-authority-contact-email")
        .locator("input"),
    ).toHaveValue("monemail@example.com");
    await expect(
      page
        .getByTestId("certification-authority-contact-phone")
        .locator("input"),
    ).toHaveValue("0101010101");
  });

  test("when i access the update general information page - do not let me click on the submit button if there is no changes", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      "/admin2/certification-authorities/settings/informations-generales",
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(page, "getCertificationAuthorityGeneralInfoForEditPage"),
    ]);

    await expect(
      page.getByTestId("certification-authority-submit-button"),
    ).toBeDisabled();
  });
});
