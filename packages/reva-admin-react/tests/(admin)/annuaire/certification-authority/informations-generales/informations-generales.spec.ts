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

const STRUCTURE_ID = "e8f214f1-3243-4dc6-8fe0-205d4cafd9d1";
const CERTIFICATION_AUTHORITY_ID = "c7399291-e79b-4e0f-b798-d3c97661e47f";
const PAGE_URL = `/admin2/certification-authority-structures/${STRUCTURE_ID}/certificateurs-administrateurs/${CERTIFICATION_AUTHORITY_ID}/informations-generales/`;
const PREVIOUS_PAGE_URL = `/admin2/certification-authority-structures/${STRUCTURE_ID}/certificateurs-administrateurs/${CERTIFICATION_AUTHORITY_ID}/`;

function createCertificationAuthorityHandlers({
  structureHasReducedRequirements = false,
}: { structureHasReducedRequirements?: boolean } = {}) {
  const getCertificationAuthorityForGeneralInfoPageHandler = fvae.query(
    "getCertificationAuthorityForGeneralInfoPage",
    graphQLResolver({
      certification_authority_getCertificationAuthority: {
        id: CERTIFICATION_AUTHORITY_ID,
        label: "Ma Structure Certificatrice",
        contactFullName: "Service VAE",
        contactEmail: "contact@example.com",
        contactPhone: "0101010101",
        websiteUrl: "https://example.com",
        account: {
          id: "81584efc-908b-4198-8424-4842926d4eaf",
          email: "admin@example.com",
          firstname: "Jean",
          lastname: "Dupont",
        },
        certificationAuthorityStructures: [
          {
            id: STRUCTURE_ID,
            label: "Ma Structure",
            hasReducedRequirements: structureHasReducedRequirements,
          },
        ],
      },
    }),
  );

  return [getCertificationAuthorityForGeneralInfoPageHandler];
}

function createUpdateMutationHandler() {
  return fvae.mutation(
    "updateCertificationAuthority",
    graphQLResolver({
      certification_authority_updateCertificationAuthority: {
        id: CERTIFICATION_AUTHORITY_ID,
        label: "Ma Structure Certificatrice",
        contactFullName: "Nouveau Contact",
        contactEmail: "nouveau@example.com",
        websiteUrl: "https://example.com",
        account: {
          id: "81584efc-908b-4198-8424-4842926d4eaf",
          email: "admin@example.com",
          firstname: "Jean",
          lastname: "Dupont",
        },
      },
    }),
  );
}

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(page, "getCertificationAuthorityForGeneralInfoPage"),
  ]);
}

test.describe("Admin certification authority general information page", () => {
  test.describe("main page", () => {
    test.use({
      mswHandlers: [
        [...createCertificationAuthorityHandlers(), ...aapCommonHandlers],
        { scope: "test" },
      ],
    });

    test("it displays the page with a correct title", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      await expect(
        page.locator("h1", { hasText: "Informations générales" }),
      ).toBeVisible();
    });

    test("it pre-fills the form with existing data", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("certification-authority-label").locator("input"),
      ).toHaveValue("Ma Structure Certificatrice");

      await expect(
        page
          .getByTestId("certification-authority-account-lastname")
          .locator("input"),
      ).toHaveValue("Dupont");

      await expect(
        page
          .getByTestId("certification-authority-account-firstname")
          .locator("input"),
      ).toHaveValue("Jean");

      await expect(
        page
          .getByTestId("certification-authority-account-email")
          .locator("input"),
      ).toHaveValue("admin@example.com");

      await expect(
        page
          .getByTestId("certification-authority-contact-full-name")
          .locator("input"),
      ).toHaveValue("Service VAE");

      await expect(
        page
          .getByTestId("certification-authority-contact-email")
          .locator("input"),
      ).toHaveValue("contact@example.com");

      await expect(
        page
          .getByTestId("certification-authority-contact-phone")
          .locator("input"),
      ).toHaveValue("0101010101");

      await expect(
        page
          .getByTestId("certification-authority-website-url")
          .locator("input"),
      ).toHaveValue("https://example.com");
    });

    test("the submit button is disabled when the form is not dirty", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("certification-authority-submit-button"),
      ).toBeDisabled();
    });
  });

  test.describe("When i use the form", () => {
    test.use({
      mswHandlers: [
        [
          ...createCertificationAuthorityHandlers(),
          createUpdateMutationHandler(),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("the submit button is enabled after editing a field", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      await page
        .getByTestId("certification-authority-contact-full-name")
        .locator("input")
        .fill("Nouveau Service");

      await expect(
        page.getByTestId("certification-authority-submit-button"),
      ).toBeEnabled();
    });

    test("the checking isGlobalContact opens the confirmation modal", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      await page
        .getByTestId("certification-authority-contact-full-name")
        .locator("input")
        .fill("Nouveau Service");

      await page
        .getByRole("checkbox", {
          name: "J’attribue ce contact référent à tous les comptes locaux de ce gestionnaire de candidatures",
        })
        .click({ force: true });

      await page.getByTestId("certification-authority-submit-button").click();

      await expect(
        page.getByRole("dialog", { name: "Attribuer le contact référent" }),
      ).toBeVisible();
    });

    test("submitting the form redirects to the certification authority page", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      await page
        .getByTestId("certification-authority-contact-full-name")
        .locator("input")
        .fill("Nouveau Contact");

      const mutationPromise = waitGraphQL(page, "updateCertificationAuthority");
      await page.getByTestId("certification-authority-submit-button").click();
      await mutationPromise;

      await expect(page).toHaveURL(PREVIOUS_PAGE_URL);
    });
  });

  test.describe("reduced structure requirements", () => {
    test.describe("when the structure has reduced requirements", () => {
      test.use({
        mswHandlers: [
          [
            ...createCertificationAuthorityHandlers({
              structureHasReducedRequirements: true,
            }),
            ...aapCommonHandlers,
          ],
          { scope: "test" },
        ],
      });

      test("displays the website URL field as required", async ({ page }) => {
        await login({ role: "admin", page });
        await page.goto(PAGE_URL);
        await waitForPageQueries(page);

        await expect(
          page
            .getByTestId("certification-authority-website-url")
            .locator("label"),
        ).toHaveText(
          "Site web Veuillez renseigner le lien vers votre établissement",
        );
      });

      test("it does not let me submit the form without filling the website url", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(PAGE_URL);
        await waitForPageQueries(page);

        await page
          .getByTestId("certification-authority-website-url")
          .locator("input")
          .fill("");

        await page.getByTestId("certification-authority-submit-button").click();

        await expect(
          page
            .getByTestId("certification-authority-website-url")
            .locator(".fr-error-text"),
        ).toBeVisible();
        await expect(page).toHaveURL(PAGE_URL);
      });
    });

    test.describe("when the structure does not have reduced requirements", () => {
      test.use({
        mswHandlers: [
          [
            ...createCertificationAuthorityHandlers(),
            createUpdateMutationHandler(),
            ...aapCommonHandlers,
          ],
          { scope: "test" },
        ],
      });

      test("displays the website URL field as optional", async ({ page }) => {
        await login({ role: "admin", page });
        await page.goto(PAGE_URL);
        await waitForPageQueries(page);

        await expect(
          page
            .getByTestId("certification-authority-website-url")
            .locator("label"),
        ).toHaveText(
          "Site web (optionnel)Veuillez renseigner le lien vers votre établissement",
        );
      });

      test("it let me validate the form without filling the website url", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(PAGE_URL);
        await waitForPageQueries(page);

        await page
          .getByTestId("certification-authority-website-url")
          .locator("input")
          .fill("");

        const mutationPromise = waitGraphQL(
          page,
          "updateCertificationAuthority",
        );
        await page.getByTestId("certification-authority-submit-button").click();
        await mutationPromise;

        await expect(page).toHaveURL(PREVIOUS_PAGE_URL);
      });
    });
  });

  test.describe("navigation", () => {
    test.use({
      mswHandlers: [
        [...createCertificationAuthorityHandlers(), ...aapCommonHandlers],
        { scope: "test" },
      ],
    });

    test("when i click on the back button it leads me back to the previous page", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      await page.getByRole("link", { name: "Retour" }).click();

      await expect(page).toHaveURL(PREVIOUS_PAGE_URL);
    });

    test.describe("when i use the breadcrumb", () => {
      test("it let me go back to the certification authority page", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(PAGE_URL);
        await waitForPageQueries(page);

        await page
          .locator(".fr-breadcrumb")
          .getByRole("link", { name: "Ma Structure Certificatrice" })
          .click();

        await expect(page).toHaveURL(PREVIOUS_PAGE_URL);
      });

      test("it let me go back to the certification authority structure page", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(PAGE_URL);
        await waitForPageQueries(page);

        await page
          .locator(".fr-breadcrumb")
          .getByRole("link", { name: "Ma Structure", exact: true })
          .click();

        await expect(page).toHaveURL(
          `/admin2/certification-authority-structures/${STRUCTURE_ID}/`,
        );
      });

      test("it let me go back to the certification authority structure list page", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(PAGE_URL);
        await waitForPageQueries(page);

        await page
          .locator(".fr-breadcrumb")
          .getByRole("link", { name: "Structures certificatrices" })
          .click();

        await expect(page).toHaveURL(
          "/admin2/certification-authority-structures/",
        );
      });
    });
  });
});
