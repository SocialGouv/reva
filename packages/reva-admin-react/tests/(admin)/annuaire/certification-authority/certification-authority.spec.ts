import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../shared/helpers/network/requests";

const { aapCommonHandlers } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

function createCertificationAuthorityHandlers() {
  return [
    fvae.query(
      "getCertificationAuthorityForAdminPage",
      graphQLResolver({
        certification_authority_getCertificationAuthority: {
          id: "c7399291-e79b-4e0f-b798-d3c97661e47f",
          label: "certification authority label",
          contactFullName: "jane doe",
          contactEmail: "monemail@example.com",
          contactPhone: "0101010101",
          departments: [],
          certifications: [],
          certificationAuthorityStructures: [
            {
              id: "e8f214f1-3243-4dc6-8fe0-205d4cafd9d1",
              label: "maStructure",
            },
          ],
          certificationAuthorityLocalAccounts: [
            {
              id: "4871a711-232b-4aba-aa5a-bc2adc51f869",
              contactEmail: null,
              account: {
                id: "81584efc-908b-4198-8424-4842926d4eaf",
                firstname: "firstname1",
                lastname: "lastname1",
                email: "email1@example.com",
              },
            },
            {
              id: "075ce4f4-8c94-4d64-9ca8-1dbaa6068eab",
              contactEmail: "contact2@example.com",
              account: {
                id: "9acb02c1-2e5c-43af-8f3f-d32ad687c131",
                firstname: "firstname2",
                lastname: "lastname2",
                email: "email2@example.com",
              },
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
    waitGraphQL(page, "getCertificationAuthorityForAdminPage"),
  ]);
}

test.describe("main page", () => {
  test.use({
    mswHandlers: [
      [...createCertificationAuthorityHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test.describe("when i access the admin certification authority page", () => {
    test("display the page with a correct title", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("certification-authority-admin-page").locator("h1"),
      ).toHaveText("certification authority label");
    });
  });
});

test.describe("local accounts summary card", () => {
  test.use({
    mswHandlers: [
      [...createCertificationAuthorityHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test.describe("when i access the admin certification authority page", () => {
    test("display the local accounts summary card", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId("certification-authority-local-accounts-summary-card")
          .locator("h2"),
      ).toHaveText("Comptes locaux");
    });

    test("display 2 local accounts", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      await waitForPageQueries(page);

      const list = page.getByTestId(
        "certification-authority-local-accounts-summary-card-list",
      );
      await expect(list.locator("li")).toHaveCount(2);
    });

    test("display a warning badge when there is no contact email", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      await waitForPageQueries(page);

      const list = page.getByTestId(
        "certification-authority-local-accounts-summary-card-list",
      );
      await expect(
        list.locator("li").first().getByTestId("no-contact-referent-badge"),
      ).toBeVisible();
    });

    test("do not display a warning badge when there is a contact email", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      await waitForPageQueries(page);

      const list = page.getByTestId(
        "certification-authority-local-accounts-summary-card-list",
      );
      await expect(
        list.locator("li").last().getByTestId("no-contact-referent-badge"),
      ).not.toBeVisible();
    });
  });

  test.describe("when i click on the add button", () => {
    test("redirect to the add local account page", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      await waitForPageQueries(page);

      await page
        .getByTestId("certification-authority-local-accounts-summary-card")
        .getByTestId("action-button")
        .click();

      await expect(page).toHaveURL(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter/",
      );
    });
  });

  test.describe("when i click on the update button", () => {
    test("redirect to the update local account page", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      await waitForPageQueries(page);

      const list = page.getByTestId(
        "certification-authority-local-accounts-summary-card-list",
      );
      await list
        .locator("li")
        .first()
        .getByTestId("update-local-account-button")
        .click();

      await expect(page).toHaveURL(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/",
      );
    });
  });
});
