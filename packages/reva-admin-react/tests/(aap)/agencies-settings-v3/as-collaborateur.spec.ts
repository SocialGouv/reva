import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../shared/helpers/network/msw";
import { waitGraphQL } from "../../shared/helpers/network/requests";

import type { Page } from "@playwright/test";

const fvae = graphql.link("https://reva-api/api/graphql");

function createSettingsHandlers() {
  const getCollaborateurSettingsInfoForAgenciesSettingsPageHandler = fvae.query(
    "getCollaborateurSettingsInfoForAgenciesSettingsPage",
    graphQLResolver({
      account_getAccountForConnectedUser: {
        id: "account-1",
      },
    }),
  );

  return [getCollaborateurSettingsInfoForAgenciesSettingsPageHandler];
}

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "getAccountInfo"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(page, "getCollaborateurSettingsInfoForAgenciesSettingsPage"),
  ]);
}

const { aapCommonHandlers } = getAAPCommonHandlers();

test.describe("Collaborateur AAP settings page", () => {
  test("it redirects me to the collaborateur settings page", async ({
    page,
    msw,
  }) => {
    msw.use(...createSettingsHandlers(), ...aapCommonHandlers);

    await login({ role: "aapCollaborateur", page });

    await page.goto(`/admin2/agencies-settings-v3/`);
    await waitForPageQueries(page);

    await expect(page).toHaveURL(
      "/admin2/agencies-settings-v3/collaborateurs/account-1/",
    );
  });
});
