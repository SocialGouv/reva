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
const DOMAIN_CODE = "DOMA";
const DOMAIN_LABEL = "Agriculture générale";
const SUB_DOMAIN_CODE = "SUB001";
const SUB_DOMAIN_LABEL = "Sous-domaine 1";
const PAGE_URL = `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/perimetre-accompagnement/certifications/`;

const coveredCertification = {
  id: "cert-1",
  codeRncp: "12345",
  label: "Certification couverte",
  level: 3,
  formacodes: [
    {
      id: "sub-domain-1-id",
      code: SUB_DOMAIN_CODE,
      label: SUB_DOMAIN_LABEL,
      parentCode: DOMAIN_CODE,
      type: "SUB_DOMAIN",
    },
  ],
  certificationAuthorityStructure: {
    id: "cas-1",
    label: "Structure certificatrice",
  },
};

const uncoveredCertificationLevel3 = {
  id: "cert-2",
  codeRncp: "23456",
  label: "Certification non couverte niveau 3",
  level: 3,
  formacodes: [
    {
      id: "sub-domain-1-id",
      code: SUB_DOMAIN_CODE,
      label: SUB_DOMAIN_LABEL,
      parentCode: DOMAIN_CODE,
      type: "SUB_DOMAIN",
    },
  ],
  certificationAuthorityStructure: {
    id: "cas-1",
    label: "Structure certificatrice",
  },
};

const uncoveredCertificationLevel4 = {
  id: "cert-3",
  codeRncp: "34567",
  label: "BTS Agronomie spécialisée",
  level: 4,
  formacodes: [
    {
      id: "sub-domain-2-id",
      code: "SUB002",
      label: "Métallurgie",
      parentCode: "DOMB",
      type: "SUB_DOMAIN",
    },
  ],
  certificationAuthorityStructure: {
    id: "cas-2",
    label: "Autre structure",
  },
};

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

function createCertificationsHandlers() {
  return [
    fvae.query(
      "getOrganismForCertifications",
      graphQLResolver({
        organism_getOrganism: {
          id: ORGANISM_ID,
          certifications: [coveredCertification],
        },
        getDegrees: [
          { id: "degree-1-id", level: 1 },
          { id: "degree-2-id", level: 2 },
          { id: "degree-3-id", level: 3 },
          { id: "degree-4-id", level: 4 },
          { id: "degree-5-id", level: 5 },
        ],
        getFormacodes: [
          {
            id: "domain-1-id",
            type: "DOMAIN",
            code: DOMAIN_CODE,
            label: DOMAIN_LABEL,
            parentCode: "DOM01",
          },
          {
            id: "domain-2-id",
            type: "DOMAIN",
            code: "DOMB",
            label: "Industrie générale",
            parentCode: "DOM02",
          },
          {
            id: "sub-domain-1-id",
            type: "SUB_DOMAIN",
            code: SUB_DOMAIN_CODE,
            label: SUB_DOMAIN_LABEL,
            parentCode: DOMAIN_CODE,
          },
          {
            id: "sub-domain-2-id",
            type: "SUB_DOMAIN",
            code: "SUB002",
            label: "Métallurgie",
            parentCode: "DOMB",
          },
        ],
        getActiveCertifications: [
          coveredCertification,
          uncoveredCertificationLevel3,
          uncoveredCertificationLevel4,
        ],
      }),
    ),
  ];
}

function createCertificationsErrorHandler() {
  return fvae.query("getOrganismForCertifications", () =>
    HttpResponse.json({
      errors: [{ message: "Une erreur est survenue" }],
    }),
  );
}

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "getOrganismForOrganismOnSitePage"),
    waitGraphQL(page, "getOrganismForCertifications"),
  ]);
}

async function goToCertificationsPage(page: Page) {
  await login({ role: "aap", page });
  await page.goto(PAGE_URL);
  await waitForPageQueries(page);
}

async function expandFilterAccordion(page: Page, label: string) {
  await page.getByRole("button", { name: label, exact: true }).click();
}

async function showAllCertifications(page: Page) {
  await page
    .getByRole("checkbox", {
      name: "Afficher les certifications couvertes uniquement",
    })
    .uncheck({ force: true });

  await expect(page).toHaveURL(/viewMode=reva/);
}

async function filterByLevel(page: Page, level: number) {
  await expandFilterAccordion(page, "Niveau");

  // Checkbox contrôlée via l'URL : on clique le label (le check Playwright
  // ne déclenche pas correctement onChange ici).
  await page
    .locator(".fr-accordion")
    .filter({ hasText: "Niveau" })
    .locator("label")
    .filter({ hasText: new RegExp(`^${level}$`) })
    .click();

  await expect(page).toHaveURL(new RegExp(`levelsFilter=${level}`));
}

test.describe("when accessing the page", () => {
  test.use({
    mswHandlers: [
      [
        ...aapCommonHandlers,
        createOnSiteOrganismHandler(),
        ...createCertificationsHandlers(),
      ],
      { scope: "test" },
    ],
  });

  test("displays page title", async ({ page }) => {
    await goToCertificationsPage(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Certifications",
    );
  });

  test("displays breadcrumb with Paramètres link for AAP", async ({ page }) => {
    await goToCertificationsPage(page);

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
    await expect(breadcrumb.getByText("Certifications")).toBeVisible();
  });

  test("displays search bar and filters", async ({ page }) => {
    await goToCertificationsPage(page);

    await expect(
      page.getByRole("searchbox", {
        name: "Rechercher code RNCP ou intitulé de certification",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox", {
        name: "Afficher les certifications couvertes uniquement",
      }),
    ).toBeChecked();
    await expect(page.getByRole("button", { name: "Formacode" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Niveau" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Réinitialiser les filtres" }),
    ).toBeVisible();
  });

  test("displays covered certifications by default", async ({ page }) => {
    await goToCertificationsPage(page);

    await expect(page.getByText("Résultat : 1 sur 1")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Certification couverte" }),
    ).toBeVisible();
    await expect(page.getByText("RNCP 12345")).toBeVisible();
    await expect(page.getByText("Niveau 3")).toBeVisible();
    await expect(
      page.getByText(`${DOMAIN_CODE} ${DOMAIN_LABEL}`),
    ).toBeVisible();
    await expect(
      page.getByText("Certification non couverte"),
    ).not.toBeVisible();
  });
});

test.describe("view mode", () => {
  test.use({
    mswHandlers: [
      [
        ...aapCommonHandlers,
        createOnSiteOrganismHandler(),
        ...createCertificationsHandlers(),
      ],
      { scope: "test" },
    ],
  });

  test("displays all active certifications when toggle is unchecked", async ({
    page,
  }) => {
    await goToCertificationsPage(page);

    await showAllCertifications(page);

    await expect(page.getByText("Résultat : 3 sur 3")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Certification couverte" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Certification non couverte niveau 3",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "BTS Agronomie spécialisée",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Certification non couverte").first(),
    ).toBeVisible();
  });
});

test.describe("search and filters", () => {
  test.use({
    mswHandlers: [
      [
        ...aapCommonHandlers,
        createOnSiteOrganismHandler(),
        ...createCertificationsHandlers(),
      ],
      { scope: "test" },
    ],
  });

  test("filters certifications by search label", async ({ page }) => {
    await goToCertificationsPage(page);

    await showAllCertifications(page);

    await page
      .getByRole("searchbox", {
        name: "Rechercher code RNCP ou intitulé de certification",
      })
      .fill("Agronomie");

    await expect(page.getByText(/Résultat : 1 sur 1/)).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "BTS Agronomie spécialisée",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Certification couverte" }),
    ).not.toBeVisible();
  });

  test("filters certifications by RNCP code", async ({ page }) => {
    await goToCertificationsPage(page);

    await page
      .getByRole("searchbox", {
        name: "Rechercher code RNCP ou intitulé de certification",
      })
      .fill("12345");

    await expect(page.getByText("Résultat : 1 sur 1")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Certification couverte" }),
    ).toBeVisible();
  });

  test("filters certifications by level", async ({ page }) => {
    await goToCertificationsPage(page);

    await showAllCertifications(page);
    await filterByLevel(page, 4);

    await expect(page.getByText(/Résultat : 1 sur 1/)).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "BTS Agronomie spécialisée",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Certification couverte" }),
    ).not.toBeVisible();
  });

  test("filters certifications by formacode", async ({ page }) => {
    await goToCertificationsPage(page);

    await showAllCertifications(page);

    await expandFilterAccordion(page, "Formacode");

    await page.getByLabel("Numéro de Formacode").fill("générale");
    await expect(page.getByText(/Résultat : 3 sur 3/)).toBeVisible();

    await page.getByLabel("Numéro de Formacode").fill("Agriculture");
    await expect(page.getByText(/Résultat : 2 sur 2/)).toBeVisible();

    await page.getByLabel("Numéro de Formacode").fill(DOMAIN_CODE);
    await expect(page.getByText(/Résultat : 2 sur 2/)).toBeVisible();

    await page.getByLabel("Numéro de Formacode").fill("Industrie");
    await expect(page.getByText(/Résultat : 1 sur 1/)).toBeVisible();

    await page.getByLabel("Numéro de Formacode").fill("Métallurgie");
    await expect(page.getByText(/Résultat : 0 sur 0/)).toBeVisible();
  });

  test("resets filters when clicking Réinitialiser les filtres", async ({
    page,
  }) => {
    await goToCertificationsPage(page);

    await showAllCertifications(page);
    await filterByLevel(page, 4);

    await expect(page.getByText(/Résultat : 1 sur 1/)).toBeVisible();

    await page
      .getByRole("button", { name: "Réinitialiser les filtres" })
      .click();

    await expect(page.getByText("Résultat : 3 sur 3")).toBeVisible();
  });
});

test.describe("navigation", () => {
  test.use({
    mswHandlers: [
      [
        ...aapCommonHandlers,
        createOnSiteOrganismHandler(),
        ...createCertificationsHandlers(),
        fvae.query(
          "getOrganismForPerimetreAccompagnementForm",
          graphQLResolver({
            organism_getOrganism: {
              id: ORGANISM_ID,
              typology: "expertFiliere",
              managedDegrees: [],
              formacodes: [],
              conventionCollectives: [],
            },
            getDegrees: [],
            getFormacodes: [],
            getConventionCollectives: [],
          }),
        ),
        fvae.query(
          "getActiveCertifications",
          graphQLResolver({ getActiveCertifications: [] }),
        ),
      ],
      { scope: "test" },
    ],
  });

  test("navigates back to perimetre accompagnement page via Retour", async ({
    page,
  }) => {
    await goToCertificationsPage(page);

    await page.getByRole("button", { name: "Retour" }).click();

    await expect(page).toHaveURL(
      `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/perimetre-accompagnement/`,
    );
  });

  test("navigates back to perimetre accompagnement page via breadcrumb", async ({
    page,
  }) => {
    await goToCertificationsPage(page);

    await page
      .getByRole("navigation", { name: "vous êtes ici :" })
      .getByRole("link", { name: "Périmètre d’accompagnement" })
      .click();

    await expect(page).toHaveURL(
      `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/perimetre-accompagnement/`,
    );
  });
});

test.describe("when form data fails to load", () => {
  test.use({
    mswHandlers: [
      [
        ...aapCommonHandlers,
        createOnSiteOrganismHandler(),
        createCertificationsErrorHandler(),
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
        "Une erreur est survenue pendant la récupération des certifications.",
      ),
    ).toBeVisible({ timeout: 15000 });
  });
});
