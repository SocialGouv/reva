import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getCertificateurCommonHandlers } from "../../../shared/helpers/common-handlers/certificateur/getCertificateurCommon.handlers";
import { graphQLResolver } from "../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../shared/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const COHORTE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const COHORTE_NOM = "Cohorte VAE Collective Test";

const { certificateurCommonHandlers } = getCertificateurCommonHandlers();

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(page, "getCertificationAuthorityStructureCGUQuery"),
    waitGraphQL(page, "getCandidaciesForAnnuaire"),
    waitGraphQL(page, "getCohortesForAnnuaire"),
  ]);
}

function createCandidacyRow({
  id,
  firstname,
  lastname,
  certificationLabel,
  codeRncp,
}: {
  id: string;
  firstname: string;
  lastname: string;
  certificationLabel: string;
  codeRncp: string;
}) {
  return {
    id,
    typeAccompagnement: "ACCOMPAGNE",
    candidate: {
      firstname,
      lastname,
      givenName: null,
      middleNames: null,
      department: {
        label: "Paris",
      },
    },
    cohorteVaeCollective: null,
    feasibility: {
      feasibilityFileSentAt: 1721832988943,
    },
    activeDossierDeValidation: null,
    jury: null,
    certification: {
      label: certificationLabel,
      codeRncp,
    },
    organism: {
      label: "Organisme Lorem Ipsum",
    },
    candidacyDropOut: null,
    status: "DOSSIER_FAISABILITE_ENVOYE",
    candidacyStatuses: [
      {
        status: "DOSSIER_FAISABILITE_ENVOYE",
        createdAt: 1721832988943,
      },
    ],
  };
}

function createAnnuaireHandlers(args?: { empty?: boolean }) {
  const empty = args?.empty ?? false;

  return [
    fvae.query(
      "getCandidaciesForAnnuaire",
      graphQLResolver({
        candidacy_getCandidaciesForCertificationAuthority: empty
          ? {
              rows: [],
              info: {
                totalRows: 0,
                totalPages: 0,
                currentPage: 1,
              },
            }
          : {
              rows: [
                createCandidacyRow({
                  id: "fb451fbc-3218-416d-9ac9-65b13432469f",
                  firstname: "Alice",
                  lastname: "Doe",
                  certificationLabel:
                    "Titre à finalité professionnelle Assistant de vie dépendance (ADVD)",
                  codeRncp: "RNCP12345",
                }),
                createCandidacyRow({
                  id: "773275af-60a3-44ec-9710-0367b0425e83",
                  firstname: "John",
                  lastname: "Doe",
                  certificationLabel:
                    "Titre à finalité professionnelle Conducteur accompagnateur de personnes à mobilité réduite - CAPMR",
                  codeRncp: "RNCP67890",
                }),
              ],
              info: {
                totalRows: 2,
                totalPages: 1,
                currentPage: 1,
              },
            },
      }),
    ),
    fvae.query(
      "getCohortesForAnnuaire",
      graphQLResolver({
        cohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount:
          [
            {
              id: COHORTE_ID,
              nom: COHORTE_NOM,
            },
          ],
      }),
    ),
  ];
}

const ALWAYS_EXPANDED_ACCORDION_LABELS = [
  "Dossier de faisabilité",
  "Dossier de validation",
  "Passage devant le jury",
  "Résultat de jury",
] as const;

const ALL_FILTERS_QUERY_STRING = `feasibility=DOSSIER_FAISABILITE_ENVOYE&validation=DOSSIER_DE_VALIDATION_ENVOYE&juryStatus=SCHEDULED&juryResult=FAILURE&cohorte=${COHORTE_ID}&dropout=true`;

const FILTER_QUERY_PARAMS = [
  "feasibility",
  "validation",
  "juryStatus",
  "juryResult",
  "cohorte",
  "dropout",
] as const;

test.describe("Annuaire page", () => {
  test.describe("when there are candidacies", () => {
    test.use({
      mswHandlers: [
        [...certificateurCommonHandlers, ...createAnnuaireHandlers()],
        { scope: "test" },
      ],
    });

    test("displays the candidacies list", async ({ page }) => {
      await login({ role: "certificateur", page });
      await page.goto("/admin2/candidacies/annuaire/");
      await waitForPageQueries(page);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Candidatures",
      );

      await expect(page.getByText("2 résultats")).toBeVisible();

      const results = page.getByTestId("results");
      await expect(results.locator(".fr-card")).toHaveCount(2);

      await expect(results.getByText("Doe Alice")).toBeVisible();
      await expect(results.getByText("Doe John")).toBeVisible();
    });
  });

  test.describe("when there are no candidacies", () => {
    test.use({
      mswHandlers: [
        [
          ...certificateurCommonHandlers,
          ...createAnnuaireHandlers({ empty: true }),
        ],
        { scope: "test" },
      ],
    });

    test("displays the empty state", async ({ page }) => {
      await login({ role: "certificateur", page });
      await page.goto("/admin2/candidacies/annuaire/");
      await waitForPageQueries(page);

      await expect(page.getByText("0 résultat")).toBeVisible();
      await expect(
        page.getByRole("heading", {
          level: 2,
          name: "Aucun résultat pour votre recherche",
        }),
      ).toBeVisible();
      await expect(page.getByAltText("Pas de résultat")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Effacer les filtres" }),
      ).toBeHidden();
    });

    test("displays the empty state with a clear filters button when filters are selected", async ({
      page,
    }) => {
      await login({ role: "certificateur", page });
      await page.goto(
        "/admin2/candidacies/annuaire/?feasibility=DOSSIER_FAISABILITE_ENVOYE",
      );
      await waitForPageQueries(page);

      await expect(
        page.getByRole("heading", {
          level: 2,
          name: "Aucun résultat pour votre recherche",
        }),
      ).toBeVisible();
      await expect(
        page
          .getByTestId("results")
          .getByRole("button", { name: "Effacer les filtres" }),
      ).toBeVisible();
    });
  });

  test.describe("when no filter is selected", () => {
    test.use({
      mswHandlers: [
        [...certificateurCommonHandlers, ...createAnnuaireHandlers()],
        { scope: "test" },
      ],
    });

    test("keeps main filter accordions expanded by default", async ({
      page,
    }) => {
      await login({ role: "certificateur", page });
      await page.goto("/admin2/candidacies/annuaire/");
      await waitForPageQueries(page);

      for (const label of ALWAYS_EXPANDED_ACCORDION_LABELS) {
        await expect(
          page.getByRole("button", { name: label, exact: true }),
        ).toHaveAttribute("aria-expanded", "true");
      }
    });

    test("keeps the VAE Collective accordion closed by default", async ({
      page,
    }) => {
      await login({ role: "certificateur", page });
      await page.goto("/admin2/candidacies/annuaire/");
      await waitForPageQueries(page);

      await expect(
        page.getByRole("button", { name: "VAE Collective", exact: true }),
      ).toHaveAttribute("aria-expanded", "false");
    });
  });

  test.describe("when filters are selected", () => {
    test.use({
      mswHandlers: [
        [...certificateurCommonHandlers, ...createAnnuaireHandlers()],
        { scope: "test" },
      ],
    });

    test("keeps main filter accordions expanded when filters are selected", async ({
      page,
    }) => {
      await login({ role: "certificateur", page });
      await page.goto(
        `/admin2/candidacies/annuaire/?${ALL_FILTERS_QUERY_STRING}`,
      );
      await waitForPageQueries(page);

      for (const label of ALWAYS_EXPANDED_ACCORDION_LABELS) {
        await expect(
          page.getByRole("button", { name: label, exact: true }),
        ).toHaveAttribute("aria-expanded", "true");
      }
    });

    test("clears all filters when clicking on Effacer les filtres", async ({
      page,
    }) => {
      await login({ role: "certificateur", page });
      await page.goto(
        `/admin2/candidacies/annuaire/?${ALL_FILTERS_QUERY_STRING}`,
      );
      await waitForPageQueries(page);

      const getCandidaciesPromise = waitGraphQL(
        page,
        "getCandidaciesForAnnuaire",
      );
      await page.getByRole("button", { name: "Effacer les filtres" }).click();
      await getCandidaciesPromise;

      const searchParams = new URL(page.url()).searchParams;
      for (const param of FILTER_QUERY_PARAMS) {
        expect(searchParams.has(param)).toBe(false);
      }

      await expect(
        page.getByRole("button", { name: "Effacer les filtres" }),
      ).toBeHidden();
    });
  });
});
