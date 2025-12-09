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

function createCertificationRegistryManagerHandlers(args?: {
  withCertificationRegistryManager?: boolean;
}) {
  const structureData = args?.withCertificationRegistryManager
    ? {
        label: "myStructure",
        certificationRegistryManager: {
          id: "bf510370-f4a5-4494-8bce-d3b0e7f65e85",
          account: {
            id: "7a929692-352c-440a-be1b-c7d96ac9b6bb",
            firstname: "John",
            lastname: "Doe",
            email: "john.doe@example.com",
          },
        },
      }
    : {
        label: "myStructure",
        certificationRegistryManager: null,
      };

  return [
    fvae.query(
      "getCertificationAuthorityStructureWithRegistryManager",
      graphQLResolver({
        certification_authority_getCertificationAuthorityStructure:
          structureData,
      }),
    ),
    fvae.mutation(
      "createCertificationRegistryManager",
      graphQLResolver({
        certification_authority_createCertificationRegistryManager: {
          id: "e5f4dc24-5f4b-47e5-a218-5cb973d01ed3",
        },
      }),
    ),
    fvae.mutation(
      "updateCertificationRegistryManager",
      graphQLResolver({
        certification_authority_updateCertificationRegistryManager: {
          id: "e5f4dc24-5f4b-47e5-a218-5cb973d01ed3",
        },
      }),
    ),
  ];
}

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(page, "getCertificationAuthorityStructureWithRegistryManager"),
  ]);
}

test.describe("global tests", () => {
  test.use({
    mswHandlers: [
      [...createCertificationRegistryManagerHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test.describe("when i access the add local account page", () => {
    test("display the page with a correct title", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/responsable-referentiel",
      );
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("certification-registry-manager-page-title"),
      ).toHaveText("Responsable de certifications");
    });
  });
});

test.describe("with no existing registry manager", () => {
  test.use({
    mswHandlers: [
      [...createCertificationRegistryManagerHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test("it let me validate the form and redirect me to the certification authority structure page when i fill it correctly", async ({
    page,
  }) => {
    await login({ role: "admin", page });

    await page.goto(
      "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/responsable-referentiel",
    );
    await waitForPageQueries(page);

    await page.locator("input[name='accountLastname']").fill("Doe");
    await page.locator("input[name='accountFirstname']").fill("John");
    await page
      .locator("input[name='accountEmail']")
      .fill("john.doe@example.com");

    const mutationPromise = waitGraphQL(
      page,
      "createCertificationRegistryManager",
    );
    await page.locator("button[type='submit']").click();

    await mutationPromise;

    await expect(page).toHaveURL(
      "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/",
    );
  });
});

test.describe("with an existing registry manager", () => {
  test.use({
    mswHandlers: [
      [
        ...createCertificationRegistryManagerHandlers({
          withCertificationRegistryManager: true,
        }),
        ...aapCommonHandlers,
      ],
      { scope: "test" },
    ],
  });

  test("it load the form with the correct values", async ({ page }) => {
    await login({ role: "admin", page });

    await page.goto(
      "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/responsable-referentiel",
    );
    await waitForPageQueries(page);

    await expect(
      page.getByRole("textbox", { name: "Nom", exact: true }),
    ).toHaveValue("Doe");
    await expect(page.getByRole("textbox", { name: "Prénom" })).toHaveValue(
      "John",
    );
    await expect(
      page.getByRole("textbox", { name: "Adresse électronique de connexion" }),
    ).toHaveValue("john.doe@example.com");
  });

  test("it let me validate the form and redirect me to the certification authority structure page when i fill it correctly", async ({
    page,
  }) => {
    await login({ role: "admin", page });

    await page.goto(
      "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/responsable-referentiel",
    );

    await waitForPageQueries(page);

    await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Doe2");
    await page.getByRole("textbox", { name: "Prénom" }).fill("John2");
    await page
      .getByRole("textbox", { name: "Adresse électronique de connexion" })
      .fill("john.doe2@example.com");

    const mutationPromise = waitGraphQL(
      page,
      "updateCertificationRegistryManager",
    );

    await page.locator("button[type='submit']").click();

    await mutationPromise;

    await expect(page).toHaveURL(
      "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/",
    );
  });
});
