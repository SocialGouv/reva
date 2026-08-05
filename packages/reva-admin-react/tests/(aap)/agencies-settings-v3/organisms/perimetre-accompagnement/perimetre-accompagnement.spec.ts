import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

import type { Page } from "@playwright/test";

const fvae = graphql.link("https://reva-api/api/graphql");

const ORGANISM_ID = "b162e2fc-f640-4802-8808-45b99689b671";
const MAISON_MERE_ID = "733540e0-1bb1-4b8d-a66d-97fc992ff522";
const DEGREE_3_ID = "degree-3-id";
const DEGREE_4_ID = "degree-4-id";
const SUB_DOMAIN_1_ID = "sub-domain-1-id";
const SUB_DOMAIN_1_CODE = "SUB001";
const SUB_DOMAIN_2_ID = "sub-domain-2-id";
const SUB_DOMAIN_2_CODE = "SUB002";
const CCN_ID = "ccn-1";
const PAGE_URL = `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/perimetre-accompagnement/`;

const { aapCommonHandlers } = getAAPCommonHandlers();

function createOnSiteOrganismHandler() {
  return fvae.query(
    "getOrganismForOrganismOnSitePage",
    graphQLResolver({
      organism_getOrganism: {
        id: ORGANISM_ID,
        label: "Mon lieu d'accueil",
        nomPublic: "Nom affiché",
        telephone: "0650505050",
        siteInternet: "https://example.com",
        emailContact: "test@example.com",
        adresseNumeroEtNomDeRue: "4 Rue de la Tour du Pin",
        conformeNormesAccessibilite: "CONFORME",
        adresseInformationsComplementaires: "",
        adresseCodePostal: "33000",
        adresseVille: "Bordeaux",
        maisonMereAAP: {
          id: MAISON_MERE_ID,
          raisonSociale: "Raison Sociale Example",
        },
        managedDegrees: [],
        formacodes: [],
        conventionCollectives: [],
        certifications: [],
        hasCandidacies: false,
      },
    }),
  );
}

function createPerimetreAccompagnementHandlers(args?: {
  typology?: "expertFiliere" | "expertBranche" | "expertBrancheEtFiliere";
}) {
  const typology = args?.typology ?? "expertFiliere";

  return [
    fvae.query(
      "getOrganismForPerimetreAccompagnementForm",
      graphQLResolver({
        organism_getOrganism: {
          id: ORGANISM_ID,
          typology,
          managedDegrees: [{ degree: { id: DEGREE_3_ID } }],
          formacodes: [
            {
              code: SUB_DOMAIN_1_CODE,
              label: "Sous-domaine 1",
              type: "SUB_DOMAIN",
              countOfChildren: 3,
            },
            {
              code: SUB_DOMAIN_2_CODE,
              label: "Sous-domaine 2",
              type: "SUB_DOMAIN",
              countOfChildren: 2,
            },
          ],
          conventionCollectives: [{ id: CCN_ID, label: "CCN Example" }],
        },
        getDegrees: [
          { id: "degree-1-id", level: 1 },
          { id: "degree-2-id", level: 2 },
          { id: DEGREE_3_ID, level: 3 },
          { id: DEGREE_4_ID, level: 4 },
        ],
        getFormacodes: [
          {
            id: "main-domain-1-id",
            type: "MAIN_DOMAIN",
            code: "DOM01",
            label: "Domaine",
            parentCode: null,
          },
          {
            id: SUB_DOMAIN_1_ID,
            type: "SUB_DOMAIN",
            code: SUB_DOMAIN_1_CODE,
            label: "Sous-domaine 1",
            parentCode: "DOM01",
          },
          {
            id: SUB_DOMAIN_2_ID,
            type: "SUB_DOMAIN",
            code: SUB_DOMAIN_2_CODE,
            label: "Sous-domaine 2",
            parentCode: "DOM01",
          },
        ],
        getConventionCollectives: [{ id: CCN_ID, label: "CCN Example" }],
      }),
    ),
    fvae.query(
      "getActiveCertifications",
      graphQLResolver({
        getActiveCertifications: [
          {
            id: "cert-1",
            codeRncp: "RNCP12345",
            label: "Certification 1",
            level: 3,
          },
          {
            id: "cert-2",
            codeRncp: "RNCP23456",
            label: "Certification 2",
            level: 3,
          },
          {
            id: "cert-3",
            codeRncp: "RNCP34567",
            label: "Certification 3",
            level: 4,
          },
        ],
      }),
    ),
  ];
}

function createUpdateMutationHandler() {
  return fvae.mutation(
    "organism_createOrUpdateOrganismOnFormacodes",
    graphQLResolver({
      organism_updateOrganismDegreesAndFormacodes: {
        id: ORGANISM_ID,
      },
    }),
  );
}

function createPerimetreAccompagnementErrorHandler() {
  return fvae.query("getOrganismForPerimetreAccompagnementForm", () =>
    HttpResponse.json({
      errors: [{ message: "Une erreur est survenue" }],
    }),
  );
}

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "getOrganismForOrganismOnSitePage"),
    waitGraphQL(page, "getOrganismForPerimetreAccompagnementForm"),
  ]);
}

async function goToPerimetreAccompagnementPage(page: Page) {
  await login({ role: "aap", page });
  await page.goto(PAGE_URL);
  await waitForPageQueries(page);
}

test.describe("perimetre accompagnement on-site page", () => {
  test.describe("when accessing the page", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createOnSiteOrganismHandler(),
          ...createPerimetreAccompagnementHandlers(),
        ],
        { scope: "test" },
      ],
    });

    test("displays page title and intro", async ({ page }) => {
      await goToPerimetreAccompagnementPage(page);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Périmètre d’accompagnement",
      );
      await expect(
        page.getByText(
          "Consultez et mettez à jour les domaines d'accompagnement et les niveaux gérés par cet organisme.",
        ),
      ).toBeVisible();
    });

    test("displays breadcrumb with Paramètres link for AAP", async ({
      page,
    }) => {
      await goToPerimetreAccompagnementPage(page);

      const breadcrumb = page.getByRole("navigation", {
        name: "vous êtes ici :",
      });

      await expect(
        breadcrumb.getByRole("link", { name: "Paramètres" }),
      ).toBeVisible();
      await expect(
        breadcrumb.getByRole("link", { name: "Nom affiché" }),
      ).toBeVisible();
      await expect(
        breadcrumb.getByText("Périmètre d’accompagnement"),
      ).toBeVisible();
    });

    test("displays degree checkboxes for levels above 2", async ({ page }) => {
      await goToPerimetreAccompagnementPage(page);

      await expect(
        page.getByText(
          "Sélectionnez les niveaux de certification associés à cet organisme :",
        ),
      ).toBeVisible();

      await expect(page.getByRole("checkbox", { name: "3" })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "4" })).not.toBeChecked();
      await expect(page.getByRole("checkbox", { name: "1" })).toHaveCount(0);
      await expect(page.getByRole("checkbox", { name: "2" })).toHaveCount(0);
    });

    test("displays formacode coverage tags", async ({ page }) => {
      await goToPerimetreAccompagnementPage(page);

      await expect(page.getByText("Cet organisme couvre :")).toBeVisible();
      await expect(page.getByText("2 champs sémantiques")).toBeVisible();
      await expect(page.getByText("5 mots clés / descripteurs")).toBeVisible();
    });

    test("displays certifications visibility count", async ({ page }) => {
      await goToPerimetreAccompagnementPage(page);

      await expect(
        page.getByText(
          "Cet organisme est visible dans les recherches des candidats pour 3 certifications.",
        ),
      ).toBeVisible();
    });

    test("displays resources sidebar", async ({ page }) => {
      await goToPerimetreAccompagnementPage(page);

      await expect(
        page.getByRole("heading", { name: "Ressources :" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "nomenclature du Formacode" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Liste des certifications" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Guide pas à pas" }),
      ).toBeVisible();
    });

    test("does not display CCN block for expertFiliere typology", async ({
      page,
    }) => {
      await goToPerimetreAccompagnementPage(page);

      await expect(
        page.getByText(/Suite à une contractualisation avec un certificateur/i),
      ).not.toBeVisible();
    });
  });

  test.describe("when organism is expertBranche", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createOnSiteOrganismHandler(),
          ...createPerimetreAccompagnementHandlers({
            typology: "expertBranche",
          }),
        ],
        { scope: "test" },
      ],
    });

    test("displays CCN contractualisation block", async ({ page }) => {
      await goToPerimetreAccompagnementPage(page);

      await expect(
        page.getByText(/Suite à une contractualisation avec un certificateur/i),
      ).toBeVisible();
      await expect(page.getByText("CCN Example")).toBeVisible();
      await expect(
        page.getByRole("link", { name: "support France VAE" }),
      ).toBeVisible();
    });
  });

  test.describe("navigation", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createOnSiteOrganismHandler(),
          ...createPerimetreAccompagnementHandlers(),
        ],
        { scope: "test" },
      ],
    });

    test("navigates to formacode page when clicking Modifier", async ({
      page,
    }) => {
      await goToPerimetreAccompagnementPage(page);

      await page.getByRole("button", { name: "Modifier" }).click();

      await expect(page).toHaveURL(/\/perimetre-accompagnement\/formacode\/?$/);
    });

    test("navigates to certifications page when clicking Voir les certifications concernées", async ({
      page,
    }) => {
      await goToPerimetreAccompagnementPage(page);

      await page
        .getByRole("button", { name: "Voir les certifications concernées" })
        .click();

      await expect(page).toHaveURL(
        /\/perimetre-accompagnement\/certifications\/?$/,
      );
    });

    test("navigates back to organism page after confirming leave", async ({
      page,
    }) => {
      await goToPerimetreAccompagnementPage(page);

      await page
        .getByRole("button", { name: "Retour à la page précédente" })
        .click();

      await expect(
        page.getByRole("heading", {
          name: "Voulez-vous vraiment quitter la page ?",
        }),
      ).toBeVisible();

      await page.getByTestId("leave-page-button").click();

      await expect(page).toHaveURL(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
      );
    });
  });

  test.describe("form submission", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createOnSiteOrganismHandler(),
          ...createPerimetreAccompagnementHandlers(),
          createUpdateMutationHandler(),
        ],
        { scope: "test" },
      ],
    });

    test("saves degree selection and shows success toast", async ({ page }) => {
      await goToPerimetreAccompagnementPage(page);

      await page.getByRole("checkbox", { name: "4" }).check({ force: true });

      const mutationPromise = waitGraphQL(
        page,
        "organism_createOrUpdateOrganismOnFormacodes",
      );

      await page.getByRole("button", { name: "Enregistrer" }).click();

      const response = await mutationPromise;
      const requestBody = response.request().postDataJSON();

      expect(requestBody.variables.data.organismId).toBe(ORGANISM_ID);
      expect(requestBody.variables.data.degreeIds).toEqual([
        DEGREE_3_ID,
        DEGREE_4_ID,
      ]);
      expect(requestBody.variables.data.formacodeIds).toEqual(
        expect.arrayContaining([SUB_DOMAIN_1_CODE, SUB_DOMAIN_2_CODE]),
      );
      expect(requestBody.variables.data.conventionCollectiveIds).toEqual([
        CCN_ID,
      ]);

      await expect(page.getByTestId("toast-success")).toBeVisible();
      await expect(page.getByTestId("toast-success")).toContainText(
        "modifications enregistrées",
      );
    });
  });

  test.describe("when form data fails to load", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createOnSiteOrganismHandler(),
          createPerimetreAccompagnementErrorHandler(),
          fvae.query(
            "getActiveCertifications",
            graphQLResolver({ getActiveCertifications: [] }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("displays load error alert", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(PAGE_URL);
      await waitGraphQL(page, "getOrganismForOrganismOnSitePage");

      await expect(
        page.getByText(
          "Une erreur est survenue pendant la récupération des niveaux de diplôme.",
        ),
      ).toBeVisible({ timeout: 15000 });
    });
  });
});
