import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import articlesDAideData from "./fixtures/espace-candidat/articlesDAide.json";
import askForRegistrationData from "./fixtures/inscription-candidat/askForRegistration.json";
import certificationBtsChaudronnierData from "./fixtures/inscription-candidat/certificationChaudronnier.json";
import certificationBtsEbenisteData from "./fixtures/inscription-candidat/certificationEbeniste.json";
import departmentsData from "./fixtures/inscription-candidat/departments.json";

const strapi = graphql.link("https://strapi.vae.gouv.fr/graphql");
const fvae = graphql.link("https://reva-api/api/graphql");

const CERTIFICATION_ID = "7ad608c2-5a4b-40eb-8ef9-7a85421b40f0";

test.describe("AAP available on certification", () => {
  test.describe("candidate registration enabled", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/inscription-candidat/?certificationId=${CERTIFICATION_ID}`,
      );
    });

    test.use({
      mswHandlers: [
        [
          fvae.query("activeFeaturesForConnectedUser", () => {
            return HttpResponse.json({
              data: {
                activeFeaturesForConnectedUser: [],
              },
            });
          }),
          fvae.query("getCertification", () => {
            return HttpResponse.json(certificationBtsChaudronnierData);
          }),
          fvae.query("getDepartments", () => {
            return HttpResponse.json(departmentsData);
          }),
          fvae.mutation("candidate_askForRegistration", () => {
            return HttpResponse.json(askForRegistrationData);
          }),
        ],
        { scope: "test" },
      ],
    });

    test("should show the certification selected on the sidebar and the modalite inconnue tag", async ({
      page,
    }) => {
      await expect(page.getByTestId("selected-certification-label")).toHaveText(
        "BTS Chaudronnier",
      );
      await expect(
        page.getByTestId("selected-certification-code-rncp"),
      ).toHaveText("12345");

      await expect(
        page.getByTestId("tag-modalite-inconnue-accompagne-disponible"),
      ).toBeVisible();
      await expect(page.getByTestId("tag-accompagne")).not.toBeVisible();
      await expect(page.getByTestId("tag-autonome")).not.toBeVisible();
    });

    test("should show the correct modalite tag after selecting 'accompagne'", async ({
      page,
    }) => {
      await expect(
        page.getByTestId("tag-modalite-inconnue-accompagne-disponible"),
      ).toBeVisible();

      await page.getByTestId("tile-accompagne").click();

      await expect(
        page.getByTestId("tag-modalite-inconnue-accompagne-disponible"),
      ).not.toBeVisible();
      await expect(page.getByTestId("tag-accompagne")).toBeVisible();
      await expect(page.getByTestId("tag-autonome")).not.toBeVisible();
    });

    test("should show the correct accompaniment tag after selecting 'autonome'", async ({
      page,
    }) => {
      await expect(
        page.getByTestId("tag-modalite-inconnue-accompagne-disponible"),
      ).toBeVisible();

      await page.getByTestId("tile-autonome").click();

      await expect(
        page.getByTestId("tag-modalite-inconnue-accompagne-disponible"),
      ).not.toBeVisible();
      await expect(page.getByTestId("tag-autonome")).toBeVisible();
      await expect(page.getByTestId("tag-accompagne")).not.toBeVisible();
    });

    test("should go back to certification page when using the update certification button", async ({
      page,
    }) => {
      await expect(
        page.getByTestId("change-certification-button"),
      ).toBeVisible();
      await expect(
        page.getByTestId("candidate-registration-back-button"),
      ).not.toBeVisible();

      const changeCertificationButton = page.getByTestId(
        "change-certification-button",
      );
      await expect(changeCertificationButton).toHaveAttribute(
        "href",
        `/certifications/${CERTIFICATION_ID}/`,
      );
    });

    test("should go back to step 1 when using the back button on step 2", async ({
      page,
    }) => {
      await page.getByTestId("tile-accompagne").click();

      await expect(
        page.getByTestId("candidate-registration-form"),
      ).toBeVisible();

      await expect(
        page.getByTestId("change-certification-button"),
      ).not.toBeVisible();

      await page.getByTestId("candidate-registration-back-button").click();

      await expect(
        page.getByTestId("candidate-registration-initial-step"),
      ).toBeVisible();
      await expect(
        page.getByTestId("candidate-registration-back-button"),
      ).not.toBeVisible();
    });

    test("should let navigation to the account registration form on step 2", async ({
      page,
    }) => {
      await expect(page.getByTestId("tile-accompagne")).toBeVisible();
      await expect(page.getByTestId("tile-autonome")).toBeVisible();

      await page.getByTestId("tile-accompagne").click();

      await expect(
        page.getByTestId("candidate-registration-form"),
      ).toBeVisible();
    });

    test("should navigate to confirmation page after submitting form", async ({
      page,
    }) => {
      await page.getByTestId("tile-autonome").click();
      await page.getByLabel("Prénom").fill("Alice");
      await page.getByLabel("Nom", { exact: true }).fill("Doe");
      await page.getByLabel("Téléphone").fill("+33 1 01 01 01 01");
      await page
        .getByLabel("Adresse électronique de connexion")
        .fill("alice.doe@example.com");
      await page.getByLabel("Département").selectOption("department1");

      await page
        .getByText("Je certifie ne pas être un agent de la fonction publique.")
        .click();

      await page.getByTestId("candidate-registration-submit-button").click();

      await expect(page).toHaveURL("/inscription-candidat/confirmation/");
    });

    test("should show error when form is submitted without checking public employee checkbox", async ({
      page,
    }) => {
      await page.getByTestId("tile-autonome").click();

      await page.getByLabel("Prénom").fill("Alice");
      await page.getByLabel("Nom", { exact: true }).fill("Doe");
      await page.getByLabel("Téléphone").fill("+33 1 01 01 01 01");
      await page
        .getByLabel("Adresse électronique de connexion")
        .fill("alice.doe@example.com");
      await page.getByLabel("Département").selectOption("department1");

      await expect(
        page.locator("fieldset:has(input[type='checkbox'])"),
      ).not.toBeVisible();

      await page.getByTestId("candidate-registration-submit-button").click();

      await expect(
        page.locator("fieldset:has(input[type='checkbox'])"),
      ).toHaveClass(/fr-fieldset--error/);
    });
  });

  test.describe("candidate registration disabled", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        `/inscription-candidat/?certificationId=${CERTIFICATION_ID}`,
      );
    });

    test.use({
      mswHandlers: [
        [
          fvae.query("getCertification", () => {
            return HttpResponse.json(certificationBtsChaudronnierData);
          }),
          fvae.query("activeFeaturesForConnectedUser", () => {
            return HttpResponse.json({
              data: {
                activeFeaturesForConnectedUser: ["CANDIDACY_CREATION_DISABLED"],
              },
            });
          }),
        ],
        { scope: "test" },
      ],
    });

    test("should show an error message on step 2", async ({ page }) => {
      await page.getByTestId("tile-autonome").click();

      await expect(
        page.getByTestId("registration-disabled-error"),
      ).toBeVisible();
    });
  });
});

test.describe("AAP not available on certification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `/inscription-candidat/?certificationId=${CERTIFICATION_ID}`,
    );
  });

  test.use({
    mswHandlers: [
      [
        fvae.query("activeFeaturesForConnectedUser", () => {
          return HttpResponse.json({
            data: {
              activeFeaturesForConnectedUser: ["CANDIDATE_REGISTRATION_V2"],
            },
          });
        }),
        fvae.query("getCertification", () => {
          return HttpResponse.json(certificationBtsEbenisteData);
        }),
        fvae.query("getDepartments", () => {
          return HttpResponse.json(departmentsData);
        }),
      ],
      { scope: "test" },
    ],
  });

  test("should show the modalite tag inconnue with aap not available label", async ({
    page,
  }) => {
    await expect(page.getByTestId("selected-certification-label")).toHaveText(
      "BTS Ébéniste",
    );

    await expect(
      page.getByTestId("tag-modalite-inconnue-accompagne-indisponible"),
    ).toBeVisible();
    await expect(page.getByTestId("tag-accompagne")).not.toBeVisible();
    await expect(page.getByTestId("tag-autonome")).not.toBeVisible();
  });

  test("should prevent choosing the 'accompagne' option", async ({ page }) => {
    await expect(
      page.getByTestId("tile-accompagne").locator("button"),
    ).toBeDisabled();
  });
});

test.describe("certification not available", () => {
  test("should redirect to /espace-candidat/ when no certificationId is provided", async ({
    page,
    msw,
  }) => {
    msw.use(
      strapi.query("getArticlesDAide", () => {
        return HttpResponse.json(articlesDAideData);
      }),
    );
    await page.goto("/inscription-candidat/");
    await expect(page).toHaveURL("/espace-candidat/");
  });
});
