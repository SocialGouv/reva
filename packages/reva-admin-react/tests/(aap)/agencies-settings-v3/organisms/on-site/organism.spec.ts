import {
  expect,
  graphql,
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
const VAE_COLLECTIVE_TOGGLE_TITLE =
  "Je souhaite activer la VAE collective à distance ou en présentiel";

function createOrganismHandlers(args?: {
  disponiblePourVaeCollective?: boolean;
  fermePourAbsenceOuConges?: boolean;
  hasCandidacies?: boolean;
}) {
  const disponiblePourVaeCollective =
    args?.disponiblePourVaeCollective ?? false;
  const fermePourAbsenceOuConges = args?.fermePourAbsenceOuConges ?? false;
  const hasCandidacies = args?.hasCandidacies ?? false;

  return [
    fvae.query(
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
            raisonSociale: "Raison Sociale Example",
          },
          managedDegrees: [],
          formacodes: [],
          conventionCollectives: [],
          certifications: [],
          hasCandidacies,
        },
      }),
    ),
    fvae.query(
      "getOrganismForOrganismDisponiblePourVaeCollectiveToggle",
      graphQLResolver({
        organism_getOrganism: {
          id: ORGANISM_ID,
          disponiblePourVaeCollective,
        },
      }),
    ),
    fvae.query(
      "getOrganismForOrganismVisibilityToggle",
      graphQLResolver({
        organism_getOrganism: {
          id: ORGANISM_ID,
          fermePourAbsenceOuConges,
        },
      }),
    ),
  ];
}

function createUpdateVaeCollectiveMutationHandler() {
  return fvae.mutation(
    "updateOrganismDisponiblePourVaeCollectiveMutation",
    graphQLResolver({
      organism_updateDisponiblePourVaeCollective: {
        id: ORGANISM_ID,
      },
    }),
  );
}

function createDeleteLieuAccueilMutationHandler() {
  return fvae.mutation(
    "deleteLieuAccueil",
    graphQLResolver({
      organism_deleteLieuAccueil: true,
    }),
  );
}

const { aapCommonHandlers } = getAAPCommonHandlers();

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "getOrganismForOrganismOnSitePage"),
    waitGraphQL(
      page,
      "getOrganismForOrganismDisponiblePourVaeCollectiveToggle",
    ),
    waitGraphQL(page, "getOrganismForOrganismVisibilityToggle"),
  ]);
}

test.describe("when accessing the page", () => {
  test.use({
    mswHandlers: [
      [
        ...aapCommonHandlers,
        ...createOrganismHandlers({
          disponiblePourVaeCollective: false,
        }),
      ],
      { scope: "test" },
    ],
  });

  test("displays organism name as page title", async ({ page }) => {
    await login({ role: "aap", page });

    await page.goto(
      `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
    );
    await waitForPageQueries(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Nom affiché",
    );
  });
});

test.describe("VAE collective toggle", () => {
  test.describe("when disabled", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createOrganismHandlers({
            disponiblePourVaeCollective: false,
          }),
          createUpdateVaeCollectiveMutationHandler(),
        ],
        { scope: "test" },
      ],
    });

    test("displays unchecked toggle", async ({ page }) => {
      await login({ role: "aap", page });

      await page.goto(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
      );

      await waitForPageQueries(page);

      const toggle = page.getByTitle(VAE_COLLECTIVE_TOGGLE_TITLE);

      await expect(toggle).not.toBeChecked();
    });

    test("displays visibility information text", async ({ page }) => {
      await login({ role: "aap", page });

      await page.goto(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
      );

      await waitForPageQueries(page);

      await expect(
        page.getByText(
          /Ce référencement vous permet d'être visible dans les résultats de recherche des porteurs de projet VAE collective/i,
        ),
      ).toBeVisible();
    });

    test("enables toggle and updates availability", async ({ page }) => {
      await login({ role: "aap", page });

      await page.goto(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
      );

      await waitForPageQueries(page);

      const toggle = page.getByTitle(VAE_COLLECTIVE_TOGGLE_TITLE);

      const mutationPromise = waitGraphQL(
        page,
        "updateOrganismDisponiblePourVaeCollectiveMutation",
      );

      const queryPromise = waitGraphQL(
        page,
        "getOrganismForOrganismDisponiblePourVaeCollectiveToggle",
      );

      await toggle.click();

      await mutationPromise;
      await queryPromise;

      await expect(
        page.getByText("Disponibilité pour la VAE collective mise à jour"),
      ).toBeVisible();
    });
  });

  test.describe("when enabled", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createOrganismHandlers({
            disponiblePourVaeCollective: true,
          }),
          createUpdateVaeCollectiveMutationHandler(),
        ],
        { scope: "test" },
      ],
    });

    test("displays checked toggle", async ({ page }) => {
      await login({ role: "aap", page });

      await page.goto(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
      );

      await waitForPageQueries(page);

      const toggle = page.getByTitle(VAE_COLLECTIVE_TOGGLE_TITLE);

      await expect(toggle).toBeChecked();
    });

    test("disables toggle and updates availability", async ({ page }) => {
      await login({ role: "aap", page });

      await page.goto(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
      );

      await waitForPageQueries(page);

      const toggle = page.getByTitle(VAE_COLLECTIVE_TOGGLE_TITLE);

      await toggle.click();

      await waitGraphQL(
        page,
        "updateOrganismDisponiblePourVaeCollectiveMutation",
      );

      await waitGraphQL(
        page,
        "getOrganismForOrganismDisponiblePourVaeCollectiveToggle",
      );

      await expect(
        page.getByText("Disponibilité pour la VAE collective mise à jour"),
      ).toBeVisible();
    });
  });
});

test.describe("delete lieu d’accueil", () => {
  test.describe("when the organism has no candidacies", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createOrganismHandlers({ hasCandidacies: false }),
          createDeleteLieuAccueilMutationHandler(),
        ],
        { scope: "test" },
      ],
    });

    test("displays the delete tile", async ({ page }) => {
      await login({ role: "aap", page });

      await page.goto(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
      );
      await waitForPageQueries(page);

      await expect(
        page.getByRole("button", { name: "Supprimer le lieu d’accueil" }),
      ).toBeVisible();
    });

    test("opens confirmation modal when clicking the delete tile", async ({
      page,
    }) => {
      await login({ role: "aap", page });

      await page.goto(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
      );
      await waitForPageQueries(page);

      await page
        .getByRole("button", { name: "Supprimer le lieu d’accueil" })
        .click();

      await expect(
        page.getByRole("heading", { name: "Supprimer un lieu d’accueil" }),
      ).toBeVisible();
    });

    test("closes the modal when clicking cancel", async ({ page }) => {
      await login({ role: "aap", page });

      await page.goto(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
      );
      await waitForPageQueries(page);

      await page
        .getByRole("button", { name: "Supprimer le lieu d’accueil" })
        .click();

      await expect(
        page.getByRole("heading", { name: "Supprimer un lieu d’accueil" }),
      ).toBeVisible();

      await page.getByRole("button", { name: "Annuler" }).click();

      await expect(
        page.getByRole("heading", { name: "Supprimer un lieu d’accueil" }),
      ).not.toBeVisible();
    });

    test("calls mutation and redirects after confirming deletion", async ({
      page,
    }) => {
      await login({ role: "aap", page });

      await page.goto(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
      );
      await waitForPageQueries(page);

      await page
        .getByRole("button", { name: "Supprimer le lieu d’accueil" })
        .click();

      const mutationPromise = waitGraphQL(page, "deleteLieuAccueil");

      await page
        .getByRole("button", { name: "Supprimer", exact: true })
        .click();

      await mutationPromise;

      await expect(page).toHaveURL(/\/agencies-settings-v3\//);
    });
  });

  test.describe("when the organism has candidacies", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createOrganismHandlers({ hasCandidacies: true }),
        ],
        { scope: "test" },
      ],
    });

    test("opens the has-candidacies modal when clicking the delete tile", async ({
      page,
    }) => {
      await login({ role: "aap", page });

      await page.goto(
        `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/organisms/${ORGANISM_ID}/on-site/`,
      );
      await waitForPageQueries(page);

      await page
        .getByRole("button", { name: "Supprimer le lieu d’accueil" })
        .click();

      await expect(
        page.getByRole("heading", { name: "Supprimer un lieu d’accueil" }),
      ).toBeVisible();

      await expect(
        page.getByText(
          "Ce lieu d’accueil a des candidatures associées. Vous ne pouvez donc pas le supprimer.",
        ),
      ).toBeVisible();
    });
  });
});
