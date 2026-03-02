import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers();

test.describe("main page", () => {
  test.use({
    mswHandlers: [[...certificateurSettingsCommonHandlers], { scope: "test" }],
  });

  test("when i access the add local account page - display the page with a correct title", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      "/admin2/certification-authorities/settings/local-accounts/add-local-account",
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
      "/admin2/certification-authorities/settings/local-accounts/add-local-account",
    );
    await certificateurSettingsCommonWait(page);

    await page
      .getByTestId("local-account-general-information-summary-card")
      .getByTestId("action-button")
      .click();

    await expect(page).toHaveURL(
      /\/certification-authorities\/settings\/local-accounts\/add-local-account\/general-information/,
    );
  });
});
