import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

const CERTIFICATION_AUTHORITY_ID = "c7399291-e79b-4e0f-b798-d3c97661e47f";
import { login } from "../../../../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";
import { graphQLResolver } from "../../../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../../../shared/helpers/network/requests";

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers({
    certificationAuthorityId: CERTIFICATION_AUTHORITY_ID,
  });

const fvae = graphql.link("https://reva-api/api/graphql");

const PAGE_URL = `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/certifications/1/parcours`;

const createParcoursCertificationHandlers = (args?: {
  withoutParcours?: boolean;
}) => {
  const { withoutParcours } = args ?? {};

  const getCertificationAndParcoursForCertificationAuthorityParcoursPageHandler =
    fvae.query(
      "getCertificationAndParcoursForCertificationAuthorityParcoursPageQuery",
      graphQLResolver({
        data: {
          getCertification: {
            id: "1",
            label: "Certification 1",
            parcours: withoutParcours
              ? {
                  rows: [],
                  info: {
                    totalRows: 0,
                    totalPages: 0,
                  },
                }
              : {
                  rows: [
                    {
                      id: "1",
                      label: "Parcours 1",
                      nomEtablissement: "Etablissement 1",
                    },
                    {
                      id: "2",
                      label: "Parcours 2",
                      nomEtablissement: "Etablissement 2",
                    },
                    {
                      id: "3",
                      label: "Parcours 3",
                      nomEtablissement: "Etablissement 3",
                    },
                  ],
                  info: {
                    totalRows: 3,
                    totalPages: 1,
                  },
                },
          },
          certification_authority_getParcoursForCertificationAndCertificationAuthority:
            withoutParcours
              ? []
              : [
                  {
                    id: "2",
                    label: "Parcours 2",
                  },
                ],
        },
      }),
    );

  const getCertificationAuthorityForCertificationsPageHandler = fvae.query(
    "getCertificationAuthorityForCertificationsPage",
    graphQLResolver({
      data: {},
    }),
  );

  const updateParcoursForCertificationAndCertificationAuthorityHandler =
    fvae.mutation(
      "updateParcoursForCertificationAndCertificationAuthorityMutation",
      graphQLResolver({
        data: {
          certification_authority_updateParcoursForCertificationAndCertificationAuthority: true,
        },
      }),
    );

  return [
    getCertificationAndParcoursForCertificationAuthorityParcoursPageHandler,
    getCertificationAuthorityForCertificationsPageHandler,
    updateParcoursForCertificationAndCertificationAuthorityHandler,
  ];
};

async function waitForPageQueries(page: Page) {
  await Promise.all([
    certificateurSettingsCommonWait(page),
    waitGraphQL(
      page,
      "getCertificationAndParcoursForCertificationAuthorityParcoursPageQuery",
    ),
  ]);
}

test.describe("when i access the parcours certification page", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        ...createParcoursCertificationHandlers(),
      ],
      { scope: "test" },
    ],
  });

  test("it should display the page with a correct title", async ({ page }) => {
    await login({ page, role: "certificateur" });
    await page.goto(PAGE_URL);
    await waitForPageQueries(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Certification 1",
    );
  });
  test("when i click on the back button it should lead to the certifications page", async ({
    page,
  }) => {
    await login({ page, role: "certificateur" });
    await page.goto(PAGE_URL);
    await waitForPageQueries(page);

    await page.getByRole("link", { name: "Retour" }).click();

    await expect(page).toHaveURL(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/certifications/`,
    );
  });
});

test.describe("breadcrumb", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        ...createParcoursCertificationHandlers(),
      ],
      { scope: "test" },
    ],
  });

  test("when i click on the 'certifications gérées' link it should lead to the certifications page", async ({
    page,
  }) => {
    await login({ page, role: "certificateur" });
    await page.goto(PAGE_URL);
    await waitForPageQueries(page);

    await page
      .locator(".fr-breadcrumb")
      .getByRole("link", { name: "Certifications gérées" })
      .click();

    await expect(page).toHaveURL(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/certifications/`,
    );
  });

  test("when i click on the 'Paramètres' link it should lead to the settings page", async ({
    page,
  }) => {
    await login({ page, role: "certificateur" });
    await page.goto(PAGE_URL);
    await waitForPageQueries(page);

    await page
      .locator(".fr-breadcrumb")
      .getByRole("link", { name: "Paramètres" })
      .click();

    await expect(page).toHaveURL(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/`,
    );
  });
});

test.describe("when I use the parcours list", () => {
  test.describe("when the certification has parcours", () => {
    test.use({
      mswHandlers: [
        [
          ...certificateurSettingsCommonHandlers,
          ...createParcoursCertificationHandlers(),
        ],
        { scope: "test" },
      ],
    });

    test("it shows the correct parcours list", async ({ page }) => {
      await login({ page, role: "certificateur" });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId("multi-select-list-item-1")
          .getByRole("button", { name: "Ajouter" }),
      ).toBeVisible();
      await expect(
        page
          .getByTestId("multi-select-list-item-2")
          .getByRole("button", { name: "Retirer" }),
      ).toBeVisible();
      await expect(
        page
          .getByTestId("multi-select-list-item-3")
          .getByRole("button", { name: "Ajouter" }),
      ).toBeVisible();
    });

    test("it let me add a parcours", async ({ page }) => {
      await login({ page, role: "certificateur" });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      const mutationPromise = waitGraphQL(
        page,
        "updateParcoursForCertificationAndCertificationAuthorityMutation",
      );

      await page
        .getByTestId("multi-select-list-item-1")
        .getByRole("button", { name: "Ajouter" })
        .click();

      await mutationPromise;
    });

    test("it let me remove a parcours", async ({ page }) => {
      await login({ page, role: "certificateur" });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      const mutationPromise = waitGraphQL(
        page,
        "updateParcoursForCertificationAndCertificationAuthorityMutation",
      );

      await page
        .getByTestId("multi-select-list-item-2")
        .getByRole("button", { name: "Retirer" })
        .click();

      await mutationPromise;
    });

    test("it let me toggle the only show added parcours switch", async ({
      page,
    }) => {
      await login({ page, role: "certificateur" });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      const queryPromise = waitGraphQL(
        page,
        "getCertificationAndParcoursForCertificationAuthorityParcoursPageQuery",
      );

      await page
        .getByRole("checkbox", {
          name: "Afficher uniquement les parcours ajoutés",
        })
        .click();

      await queryPromise;
    });

    test("it let me search for a parcours", async ({ page }) => {
      await login({ page, role: "certificateur" });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      const queryPromise = waitGraphQL(
        page,
        "getCertificationAndParcoursForCertificationAuthorityParcoursPageQuery",
      );

      const searchBar = page.getByRole("searchbox", { name: "Rechercher" });
      await searchBar.fill("Parcours 1");
      await searchBar.press("Enter");

      await queryPromise;
    });
  });

  test.describe("when the certification has no parcours", () => {
    test.use({
      mswHandlers: [
        [
          ...certificateurSettingsCommonHandlers,
          ...createParcoursCertificationHandlers({ withoutParcours: true }),
        ],
        { scope: "test" },
      ],
    });

    test("it shows the empty state component", async ({ page }) => {
      await login({ page, role: "certificateur" });
      await page.goto(PAGE_URL);
      await waitForPageQueries(page);

      await expect(
        page.getByRole("heading", { name: "Aucun parcours trouvé" }),
      ).toBeVisible();
    });
  });
});
