import { expect, Page, test } from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { waitGraphQL } from "../../../shared/helpers/network/requests";

const { aapCommonHandlers } = getAAPCommonHandlers();

async function waitForPageQueries(page: Page) {
  await Promise.all([waitGraphQL(page, "activeFeaturesForConnectedUser")]);
}

test.describe("Collaborateur settings page", () => {
  test.use({
    mswHandlers: [[...aapCommonHandlers], { scope: "test" }],
  });
  test.describe("as an AAP collaborateur", () => {
    test.describe("when I access i access the collaborateur settings page", () => {
      test("it shows the correct title", async ({ page }) => {
        await login({ role: "aapCollaborateur", page });
        await page.goto(
          "/admin2/agencies-settings-v3/collaborateurs/account-1/",
        );
        await waitForPageQueries(page);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          "Paramètres",
        );
      });
    });
  });
});
