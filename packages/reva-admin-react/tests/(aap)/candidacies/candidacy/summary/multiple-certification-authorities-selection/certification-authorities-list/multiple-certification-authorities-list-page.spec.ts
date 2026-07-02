import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../../../shared/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

type CertificationAuthority = {
  id: string;
  label: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

const createCertificationAuthoritiesListHandlers = (
  certificationAuthorities: CertificationAuthority[],
) => [
  fvae.query(
    "getCandidacyForMultipleCertificationAuthoritiesListPage",
    graphQLResolver({
      getCandidacyById: {
        id: CANDIDACY_ID,
        certificationAuthorities,
      },
    }),
  ),
];

const goToCertificationAuthoritiesListPage = async (
  page: Parameters<typeof login>[0]["page"],
) => {
  await login({ role: "aap", page });
  await page.goto(
    `/admin2/candidacies/${CANDIDACY_ID}/summary/multiple-certification-authorities-selection/certification-authorities-list/`,
  );
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(
      page,
      "getCandidacyForMultipleCertificationAuthoritiesListPage",
    ),
  ]);
};

test.describe("Multiple certification authorities list page", () => {
  test.describe("with certification authorities", () => {
    const certificationAuthorities: CertificationAuthority[] = [
      {
        id: "cert-auth-1",
        label: "Autorité Certificatrice Alpha",
        contactEmail: "alpha@example.com",
        contactPhone: "0102030405",
      },
      {
        id: "cert-auth-2",
        label: "Autorité Certificatrice Beta",
        contactEmail: "beta@example.com",
        contactPhone: "0607080910",
      },
    ];

    test.use({
      mswHandlers: [
        [
          ...createCertificationAuthoritiesListHandlers(
            certificationAuthorities,
          ),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should display the page title and description", async ({ page }) => {
      await goToCertificationAuthoritiesListPage(page);

      await expect(
        page.getByRole("heading", { name: "Certificateur" }),
      ).toBeVisible();
      await expect(
        page.getByText(
          "Le certificateur sélectionné devra étudier les dossiers de faisabilité et de validation de cette candidature.",
          { exact: false },
        ),
      ).toBeVisible();
    });

    test("should display a card for each certification authority with its contact information", async ({
      page,
    }) => {
      await goToCertificationAuthoritiesListPage(page);

      const cards = page.getByTestId("certification-authority-card");
      await expect(cards).toHaveCount(2);

      await expect(
        page.getByText("Autorité Certificatrice Alpha"),
      ).toBeVisible();
      await expect(page.getByText("alpha@example.com")).toBeVisible();
      await expect(page.getByText("0102030405")).toBeVisible();

      await expect(
        page.getByText("Autorité Certificatrice Beta"),
      ).toBeVisible();
      await expect(page.getByText("beta@example.com")).toBeVisible();
      await expect(page.getByText("0607080910")).toBeVisible();
    });

    test("should lead me back to the candidacy summary page when I click on the 'Retour' button", async ({
      page,
    }) => {
      await goToCertificationAuthoritiesListPage(page);

      await page.getByRole("link", { name: "Retour" }).click();

      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/summary/`,
      );
    });

    test("should filter the certification authorities list when searching", async ({
      page,
    }) => {
      await goToCertificationAuthoritiesListPage(page);

      const searchBar = page.getByRole("searchbox", { name: "Rechercher" });
      await searchBar.fill("Alpha");
      await searchBar.press("Enter");

      await expect(
        page.getByText("Autorité Certificatrice Alpha"),
      ).toBeVisible();
      await expect(
        page.getByText("Autorité Certificatrice Beta"),
      ).not.toBeVisible();
      await expect(
        page.getByTestId("certification-authority-card"),
      ).toHaveCount(1);
    });

    test("should display the empty state when no certification authority matches the search", async ({
      page,
    }) => {
      await goToCertificationAuthoritiesListPage(page);

      const searchBar = page.getByRole("searchbox", { name: "Rechercher" });
      await searchBar.fill("Nonexistent certification authority");
      await searchBar.press("Enter");

      await expect(
        page.getByRole("heading", { name: "Aucun résultat trouvé" }),
      ).toBeVisible();
    });
  });

  test.describe("with more than one page of certification authorities", () => {
    const certificationAuthorities: CertificationAuthority[] = Array.from(
      { length: 11 },
      (_, i) => ({
        id: `cert-auth-${i + 1}`,
        label: `Autorité Certificatrice ${i + 1}`,
      }),
    );

    test.use({
      mswHandlers: [
        [
          ...createCertificationAuthoritiesListHandlers(
            certificationAuthorities,
          ),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should display only the first 10 certification authorities and navigate to the next page", async ({
      page,
    }) => {
      await goToCertificationAuthoritiesListPage(page);

      await expect(
        page.getByTestId("certification-authority-card"),
      ).toHaveCount(10);
      await expect(
        page.getByText("Autorité Certificatrice 11"),
      ).not.toBeVisible();

      await page.getByRole("link", { name: "2", exact: true }).click();

      await expect(page).toHaveURL(/page=2/);
      await expect(
        page.getByTestId("certification-authority-card"),
      ).toHaveCount(1);
      await expect(page.getByText("Autorité Certificatrice 11")).toBeVisible();
    });
  });

  test.describe("without certification authorities", () => {
    test.use({
      mswHandlers: [
        [
          ...createCertificationAuthoritiesListHandlers([]),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should display the empty state", async ({ page }) => {
      await goToCertificationAuthoritiesListPage(page);

      await expect(
        page.getByRole("heading", { name: "Aucun résultat trouvé" }),
      ).toBeVisible();
    });
  });

  test.describe("when I click on a certification authority card", () => {
    test.use({
      mswHandlers: [
        [
          ...createCertificationAuthoritiesListHandlers([
            {
              id: "cert-auth-1",
              label: "Autorité Certificatrice Alpha",
              contactEmail: "alpha@example.com",
              contactPhone: "0102030405",
            },
          ]),
          ...aapCommonHandlers,
          fvae.mutation(
            "updateCertificationAuthorityForMultipleCertificationAuthoritiesListPage",
            graphQLResolver({
              candidacy_updateCertificationAuthority: {
                id: CANDIDACY_ID,
              },
            }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("should update the certification authority and redirect to the certification authority details page", async ({
      page,
    }) => {
      await goToCertificationAuthoritiesListPage(page);

      const mutationPromise = waitGraphQL(
        page,
        "updateCertificationAuthorityForMultipleCertificationAuthoritiesListPage",
      );

      await page.getByText("Autorité Certificatrice Alpha").click();

      await mutationPromise;

      await expect(page.getByTestId("toast-success")).toBeVisible();
      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/summary/certification-authority-details/`,
      );
    });
  });
});
