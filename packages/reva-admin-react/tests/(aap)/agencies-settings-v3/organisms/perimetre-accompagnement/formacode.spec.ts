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
const MAIN_DOMAIN_1_CODE = "DOM01";
const MAIN_DOMAIN_2_CODE = "DOM02";
const DOMAIN_1_ID = "domain-1-id";
const DOMAIN_1_CODE = "DOMA";
const DOMAIN_2_ID = "domain-2-id";
const DOMAIN_2_CODE = "DOMB";
const SUB_DOMAIN_1_ID = "sub-domain-1-id";
const SUB_DOMAIN_1_CODE = "SUB001";
const SUB_DOMAIN_2_ID = "sub-domain-2-id";
const SUB_DOMAIN_2_CODE = "SUB002";
const SUB_DOMAIN_3_ID = "sub-domain-3-id";
const SUB_DOMAIN_3_CODE = "SUB003";
const CCN_ID = "ccn-1";
const PAGE_URL = `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/perimetre-accompagnement/formacode/`;

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

function createFormacodesFormHandlers(args?: {
  typology?: "expertFiliere" | "expertBranche" | "expertBrancheEtFiliere";
}) {
  const typology = args?.typology ?? "expertFiliere";

  return [
    fvae.query(
      "getOrganismForFormacodesForm",
      graphQLResolver({
        organism_getOrganism: {
          id: ORGANISM_ID,
          typology,
          managedDegrees: [{ degree: { id: DEGREE_3_ID } }],
          formacodes: [
            {
              code: SUB_DOMAIN_1_CODE,
              label: "Sous-domaine 1",
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
            code: MAIN_DOMAIN_1_CODE,
            label: "Agriculture",
            parentCode: null,
          },
          {
            id: "main-domain-2-id",
            type: "MAIN_DOMAIN",
            code: MAIN_DOMAIN_2_CODE,
            label: "Industrie",
            parentCode: null,
          },
          {
            id: DOMAIN_1_ID,
            type: "DOMAIN",
            code: DOMAIN_1_CODE,
            label: "Agriculture générale",
            parentCode: MAIN_DOMAIN_1_CODE,
          },
          {
            id: DOMAIN_2_ID,
            type: "DOMAIN",
            code: DOMAIN_2_CODE,
            label: "Industrie générale",
            parentCode: MAIN_DOMAIN_2_CODE,
          },
          {
            id: SUB_DOMAIN_1_ID,
            type: "SUB_DOMAIN",
            code: SUB_DOMAIN_1_CODE,
            label: "Sous-domaine 1",
            parentCode: DOMAIN_1_CODE,
          },
          {
            id: SUB_DOMAIN_2_ID,
            type: "SUB_DOMAIN",
            code: SUB_DOMAIN_2_CODE,
            label: "Sous-domaine 2",
            parentCode: DOMAIN_1_CODE,
          },
          {
            id: SUB_DOMAIN_3_ID,
            type: "SUB_DOMAIN",
            code: SUB_DOMAIN_3_CODE,
            label: "Métallurgie",
            parentCode: DOMAIN_2_CODE,
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

function createFormacodesFormErrorHandler() {
  return fvae.query("getOrganismForFormacodesForm", () =>
    HttpResponse.json({
      errors: [{ message: "Une erreur est survenue" }],
    }),
  );
}

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "getOrganismForOrganismOnSitePage"),
    waitGraphQL(page, "getOrganismForFormacodesForm"),
  ]);
}

async function goToFormacodePage(page: Page) {
  await login({ role: "aap", page });
  await page.goto(PAGE_URL);
  await waitForPageQueries(page);
}

async function expandDomainAccordion(page: Page, domainLabel: string) {
  const accordionButton = page
    .getByRole("checkbox", { name: new RegExp(domainLabel) })
    .locator("..")
    .locator("..")
    .getByRole("button");

  const box = await accordionButton.boundingBox();
  if (!box) {
    throw new Error(`Accordion button for "${domainLabel}" not found`);
  }

  // La checkbox domaine (absolute z-10) couvre la gauche du bouton :
  // on clique à 20px du bord droit pour viser la zone du chevron.
  await accordionButton.click({
    position: { x: box.width - 20, y: box.height / 2 },
  });

  await expect(accordionButton).toHaveAttribute("aria-expanded", "true");
}

test.describe("formacode on-site page", () => {
  test.describe("when accessing the page", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createOnSiteOrganismHandler(),
          ...createFormacodesFormHandlers(),
        ],
        { scope: "test" },
      ],
    });

    test("displays page title", async ({ page }) => {
      await goToFormacodePage(page);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Périmètre d’accompagnement via le Formacode",
      );
    });

    test("displays breadcrumb with Paramètres link for AAP", async ({
      page,
    }) => {
      await goToFormacodePage(page);

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
        breadcrumb.getByRole("link", { name: "Périmètre d’accompagnement" }),
      ).toBeVisible();
      await expect(breadcrumb.getByText("Formacode")).toBeVisible();
    });

    test("displays search bar", async ({ page }) => {
      await goToFormacodePage(page);

      await expect(
        page.getByRole("searchbox", {
          name: "Rechercher par champs sémantique, mot clé ou formacode",
        }),
      ).toBeVisible();
    });

    test("displays formacode domains hierarchy", async ({ page }) => {
      await goToFormacodePage(page);

      await expect(
        page.getByText("Agriculture", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Industrie", { exact: true })).toBeVisible();
      await expect(
        page.getByRole("checkbox", {
          name: `${DOMAIN_1_CODE} Agriculture générale`,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("checkbox", {
          name: `${DOMAIN_2_CODE} Industrie générale`,
        }),
      ).toBeVisible();
    });

    test("displays pre-checked subdomain after expanding accordion", async ({
      page,
    }) => {
      await goToFormacodePage(page);

      await expandDomainAccordion(page, "Agriculture générale");

      await expect(
        page.getByRole("checkbox", {
          name: `${SUB_DOMAIN_1_CODE} Sous-domaine 1`,
        }),
      ).toBeChecked();
      await expect(
        page.getByRole("checkbox", {
          name: `${SUB_DOMAIN_2_CODE} Sous-domaine 2`,
        }),
      ).not.toBeChecked();
    });

    test("displays resources sidebar", async ({ page }) => {
      await goToFormacodePage(page);

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
  });

  test.describe("when organism is expertBranche", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createOnSiteOrganismHandler(),
          ...createFormacodesFormHandlers({ typology: "expertBranche" }),
        ],
        { scope: "test" },
      ],
    });

    test("does not display formacode domains selection", async ({ page }) => {
      await goToFormacodePage(page);

      await expect(
        page.getByText("Agriculture", { exact: true }),
      ).not.toBeVisible();
      await expect(
        page.getByText("Industrie", { exact: true }),
      ).not.toBeVisible();
      await expect(
        page.getByRole("checkbox", {
          name: `${DOMAIN_1_CODE} Agriculture générale`,
        }),
      ).toHaveCount(0);
    });
  });

  test.describe("search", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createOnSiteOrganismHandler(),
          ...createFormacodesFormHandlers(),
        ],
        { scope: "test" },
      ],
    });

    test("filters formacodes by label", async ({ page }) => {
      await goToFormacodePage(page);

      await page
        .getByRole("searchbox", {
          name: "Rechercher par champs sémantique, mot clé ou formacode",
        })
        .fill("Métallurgie");

      await expect(page.getByText("Industrie", { exact: true })).toBeVisible();
      await expect(
        page.getByText("Agriculture", { exact: true }),
      ).not.toBeVisible();
      await expect(
        page.getByRole("checkbox", {
          name: `${SUB_DOMAIN_3_CODE} Métallurgie`,
        }),
      ).toBeVisible();
    });

    test("filters formacodes by code", async ({ page }) => {
      await goToFormacodePage(page);

      await page
        .getByRole("searchbox", {
          name: "Rechercher par champs sémantique, mot clé ou formacode",
        })
        .fill(SUB_DOMAIN_1_CODE);

      await expect(
        page.getByText("Agriculture", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Industrie", { exact: true }),
      ).not.toBeVisible();
      await expect(
        page.getByRole("checkbox", {
          name: `${SUB_DOMAIN_1_CODE} Sous-domaine 1`,
        }),
      ).toBeVisible();
    });
  });

  test.describe("navigation", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createOnSiteOrganismHandler(),
          ...createFormacodesFormHandlers(),
          fvae.query(
            "getOrganismForPerimetreAccompagnementForm",
            graphQLResolver({
              organism_getOrganism: {
                id: ORGANISM_ID,
                typology: "expertFiliere",
                managedDegrees: [{ degree: { id: DEGREE_3_ID } }],
                formacodes: [],
                conventionCollectives: [],
              },
              getDegrees: [{ id: DEGREE_3_ID, level: 3 }],
              getFormacodes: [],
              getConventionCollectives: [],
            }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("navigates back to perimetre accompagnement page via breadcrumb", async ({
      page,
    }) => {
      await goToFormacodePage(page);

      await page
        .getByRole("navigation", { name: "vous êtes ici :" })
        .getByRole("link", { name: "Périmètre d’accompagnement" })
        .click();

      await expect(page).toHaveURL(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/perimetre-accompagnement/`,
      );
    });

    test("opens leave confirmation modal when clicking Retour", async ({
      page,
    }) => {
      await goToFormacodePage(page);

      await page
        .getByRole("button", { name: "Retour à la page précédente" })
        .click();

      await expect(
        page.getByRole("heading", {
          name: "Voulez-vous vraiment quitter la page ?",
        }),
      ).toBeVisible();

      await page.getByTestId("stay-on-page-button").click();

      await expect(
        page.getByRole("heading", {
          name: "Voulez-vous vraiment quitter la page ?",
        }),
      ).not.toBeVisible();
      await expect(page).toHaveURL(PAGE_URL);
    });
  });

  test.describe("form submission", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createOnSiteOrganismHandler(),
          ...createFormacodesFormHandlers(),
          createUpdateMutationHandler(),
        ],
        { scope: "test" },
      ],
    });

    test("saves formacode selection and shows success toast", async ({
      page,
    }) => {
      await goToFormacodePage(page);

      await expandDomainAccordion(page, "Agriculture générale");

      await page
        .getByRole("checkbox", {
          name: `${SUB_DOMAIN_2_CODE} Sous-domaine 2`,
        })
        .check({ force: true });

      const mutationPromise = waitGraphQL(
        page,
        "organism_createOrUpdateOrganismOnFormacodes",
      );

      await page.getByRole("button", { name: "Enregistrer" }).click();

      const response = await mutationPromise;
      const requestBody = response.request().postDataJSON();

      expect(requestBody.variables.data.organismId).toBe(ORGANISM_ID);
      expect(requestBody.variables.data.degreeIds).toEqual([DEGREE_3_ID]);
      expect(requestBody.variables.data.formacodeIds).toEqual(
        expect.arrayContaining([SUB_DOMAIN_1_CODE, SUB_DOMAIN_2_CODE]),
      );
      expect(requestBody.variables.data.formacodeIds).toHaveLength(2);
      expect(requestBody.variables.data.conventionCollectiveIds).toEqual([
        CCN_ID,
      ]);

      await expect(page.getByTestId("toast-success")).toBeVisible();
      await expect(page.getByTestId("toast-success")).toContainText(
        "modifications enregistrées",
      );
    });

    test("selects all subdomains when checking a domain", async ({ page }) => {
      await goToFormacodePage(page);

      await page
        .getByRole("checkbox", {
          name: `${DOMAIN_1_CODE} Agriculture générale`,
        })
        .check({ force: true });

      const mutationPromise = waitGraphQL(
        page,
        "organism_createOrUpdateOrganismOnFormacodes",
      );

      await page.getByRole("button", { name: "Enregistrer" }).click();

      const response = await mutationPromise;
      const requestBody = response.request().postDataJSON();

      expect(requestBody.variables.data.formacodeIds).toEqual(
        expect.arrayContaining([SUB_DOMAIN_1_CODE, SUB_DOMAIN_2_CODE]),
      );
      expect(requestBody.variables.data.formacodeIds).toHaveLength(2);

      await expect(page.getByTestId("toast-success")).toBeVisible();
    });
  });

  test.describe("when form data fails to load", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createOnSiteOrganismHandler(),
          createFormacodesFormErrorHandler(),
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
