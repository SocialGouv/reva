import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";

const CERTIFICATION_AUTHORITY_ID = "c7399291-e79b-4e0f-b798-d3c97661e47f";

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers({
    certificationAuthorityId: CERTIFICATION_AUTHORITY_ID,
  });

test.describe("main page", () => {
  test.use({
    mswHandlers: [[...certificateurSettingsCommonHandlers], { scope: "test" }],
  });

  test("when i access the add local account page - display the page with a correct title", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-accounts/add-local-account`,
    );
    await certificateurSettingsCommonWait(page);

    await expect(
      page
        .getByTestId("add-certification-authority-local-account-page")
        .locator("h1"),
    ).toHaveText("Nouveau compte local");
  });
});

test.describe("general information summary card", () => {
  test.use({
    mswHandlers: [[...certificateurSettingsCommonHandlers], { scope: "test" }],
  });

  test("when i click on the update button - redirect me to the add local account general information page", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-accounts/add-local-account`,
    );
    await certificateurSettingsCommonWait(page);

    await page
      .getByTestId("local-account-general-information-summary-card")
      .getByTestId("action-button")
      .click();

    await expect(page).toHaveURL(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-accounts/add-local-account/general-information/`,
    );
  });
});
