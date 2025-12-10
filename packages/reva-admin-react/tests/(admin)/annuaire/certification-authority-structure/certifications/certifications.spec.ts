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

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(
      page,
      "getCertificationAuthorityStructureForAdminCertificationsPage",
    ),
  ]);
}

const updateCertificationAuthorityStructureCertificationsHandlers = (args?: {
  withoutCertifications?: boolean;
}) => {
  const { withoutCertifications } = args ?? {};

  const getCertificationAuthorityStructureForCertificationsPageHandler =
    fvae.query(
      "getCertificationAuthorityStructureForAdminCertificationsPage",
      graphQLResolver({
        certification_authority_getCertificationAuthorityStructure: {
          id: "e8f214f1-3243-4dc6-8fe0-205d4cafd9d1",
          label: "maStructure",
          certifications: withoutCertifications
            ? []
            : [
                {
                  id: "cert-1",
                },
              ],
        },
        searchCertificationsForAdmin: withoutCertifications
          ? {
              rows: [],
              info: {
                totalPages: 0,
                totalRows: 0,
              },
            }
          : {
              rows: [
                {
                  id: "cert-1",
                  codeRncp: "RNCP12345",
                  label: "Certification 1",
                },
                {
                  id: "cert-2",
                  codeRncp: "RNCP67890",
                  label: "Certification 2",
                },
                {
                  id: "cert-3",
                  codeRncp: "RNCP11111",
                  label: "Certification 3",
                },
              ],
              info: {
                totalPages: 1,
                totalRows: 3,
              },
            },
      }),
    );

  const updateCertificationAuthorityStructureCertificationsHandler =
    fvae.mutation(
      "updateCertificationAuthorityStructureForAdminCertificationsPage",
      graphQLResolver({
        certification_authority_updateCertificationAuthorityStructureCertifications:
          {
            id: "e8f214f1-3243-4dc6-8fe0-205d4cafd9d1",
          },
      }),
    );

  return [
    getCertificationAuthorityStructureForCertificationsPageHandler,
    updateCertificationAuthorityStructureCertificationsHandler,
  ];
};

test.describe("Certification authority structure certifications page", () => {
  test.describe("when I access the certifications page", () => {
    test.use({
      mswHandlers: [
        [
          ...updateCertificationAuthorityStructureCertificationsHandlers(),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });
    test("it shows the correct title", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certifications/",
      );
      await waitForPageQueries(page);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Certifications gérées",
      );
    });

    test("it shows the correct description", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certifications/",
      );
      await waitForPageQueries(page);

      await expect(
        page.getByText(
          "Sélectionnez toutes les certifications proposées par la structure certificatrice.",
        ),
      ).toBeVisible();
    });
  });

  test.describe("when I use the certifications component", () => {
    test.describe("when there are certifications", () => {
      test.use({
        mswHandlers: [
          [
            ...updateCertificationAuthorityStructureCertificationsHandlers(),
            ...aapCommonHandlers,
          ],
          { scope: "test" },
        ],
      });
      test("it shows the correct certifications list", async ({ page }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certifications/",
        );
        await waitForPageQueries(page);

        await expect(
          page
            .getByTestId("multi-select-list-item-cert-1")
            .getByRole("button", { name: "Retirer" }),
        ).toBeVisible();
        await expect(
          page
            .getByTestId("multi-select-list-item-cert-2")
            .getByRole("button", { name: "Ajouter" }),
        ).toBeVisible();
        await expect(
          page
            .getByTestId("multi-select-list-item-cert-3")
            .getByRole("button", { name: "Ajouter" }),
        ).toBeVisible();
      });

      test("it let me add a certification to the certification authority structure", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certifications/",
        );
        await waitForPageQueries(page);

        const mutationPromise = waitGraphQL(
          page,
          "updateCertificationAuthorityStructureForAdminCertificationsPage",
        );

        await page
          .getByTestId("multi-select-list-item-cert-2")
          .getByRole("button", { name: "Ajouter" })
          .click();

        await mutationPromise;
      });

      test("it let me remove a certification from the certification authority structure", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certifications/",
        );
        await waitForPageQueries(page);

        const mutationPromise = waitGraphQL(
          page,
          "updateCertificationAuthorityStructureForAdminCertificationsPage",
        );

        await page
          .getByTestId("multi-select-list-item-cert-1")
          .getByRole("button", { name: "Retirer" })
          .click();

        await mutationPromise;
      });

      test("it let me toggle the only show added items switch", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certifications/",
        );
        await waitForPageQueries(page);

        const queryPromise = waitGraphQL(
          page,
          "getCertificationAuthorityStructureForAdminCertificationsPage",
        );

        await page
          .getByRole("checkbox", {
            name: "Afficher les certifications ajoutées uniquement",
          })
          .click();

        await queryPromise;
      });

      test("it let me search for a certification", async ({ page }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certifications/",
        );
        await waitForPageQueries(page);

        const queryPromise = waitGraphQL(
          page,
          "getCertificationAuthorityStructureForAdminCertificationsPage",
        );

        const searchBar = page.getByRole("searchbox", {
          name: "Rechercher par code RNCP, intitulé de certification etc...",
        });

        await searchBar.fill("RNCP12345");
        await searchBar.press("Enter");

        await queryPromise;
      });

      test("it let me view the certification details page", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certifications/",
        );
        await waitForPageQueries(page);

        await page
          .getByTestId("multi-select-list-item-cert-1")
          .getByRole("link", { name: "Voir la fiche" })
          .click();

        await expect(page).toHaveURL("/admin2/certifications/cert-1/");
      });
    });

    test.describe("when there are no certifications", () => {
      test.use({
        mswHandlers: [
          [
            ...updateCertificationAuthorityStructureCertificationsHandlers({
              withoutCertifications: true,
            }),
            ...aapCommonHandlers,
          ],
          { scope: "test" },
        ],
      });
      test("it shows the empty state component", async ({ page }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certifications/",
        );
        await waitForPageQueries(page);
        await expect(
          page.getByRole("heading", {
            name: "Aucune certification trouvée",
          }),
        ).toBeVisible();
      });
    });
  });

  test.describe("when I use the breadcrumb", () => {
    test.use({
      mswHandlers: [
        [
          ...updateCertificationAuthorityStructureCertificationsHandlers(),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });
    test("it let me go back to the certification authority structure page", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certifications/",
      );
      await waitForPageQueries(page);
      await page
        .locator(".fr-breadcrumb")
        .getByRole("link", { name: "maStructure" })
        .click();
      await expect(page).toHaveURL(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/",
      );
    });
    test("it let me go back to the certification authority structure list page", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certifications/",
      );
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
