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

function createAddLocalAccountHandlers() {
  return [
    fvae.query(
      "getCertificationAuthorityAndStructureForAdminAddLocalAccountPage",
      graphQLResolver({
        certification_authority_getCertificationAuthority: {
          id: "c7399291-e79b-4e0f-b798-d3c97661e47f",
          label: "certification authority label",
        },
        certification_authority_structure_getCertificationAuthorityStructure: {
          id: "e8f214f1-3243-4dc6-8fe0-205d4cafd9d1",
          label: "maStructure",
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
      "getCertificationAuthorityAndStructureForAdminAddLocalAccountPage",
    ),
  ]);
}

test.describe("main page", () => {
  test.use({
    mswHandlers: [
      [...createAddLocalAccountHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test.describe("when i access the add local account page", () => {
    test("display the page with a correct title", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter",
      );
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId("add-certification-authority-local-account-page")
          .locator("h1"),
      ).toHaveText("Nouveau compte local");
    });
  });
});

test.describe("general information summary card", () => {
  test.use({
    mswHandlers: [
      [...createAddLocalAccountHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test.describe("when i click on the update button", () => {
    test("redirect me to the add local account general information page", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter",
      );
      await waitForPageQueries(page);

      await page
        .getByTestId("local-account-general-information-summary-card")
        .getByTestId("action-button")
        .click();

      await expect(page).toHaveURL(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter/informations-generales/",
      );
    });
  });
});
