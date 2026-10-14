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
    waitGraphQL(page, "getCertificationAuthorityForAdminCertificationsPage"),
  ]);
}

const updateCertificationAuthorityCertificationsHandlers = (args?: {
  withoutCertifications?: boolean;
}) => {
  const { withoutCertifications } = args ?? {};

  const getCertificationAuthorityForCertificationsPageHandler = fvae.query(
    "getCertificationAuthorityForAdminCertificationsPage",
    graphQLResolver({
      certification_authority_getCertificationAuthority: {
        id: "c7399291-e79b-4e0f-b798-d3c97661e47f",
        label: "certification authority label",
        certificationAuthorityStructures: [
          {
            id: "e8f214f1-3243-4dc6-8fe0-205d4cafd9d1",
            label: "maStructure",
          },
        ],
        certifications: withoutCertifications
          ? []
          : [
              {
                id: "cert-1",
                codeRncp: "RNCP12345",
                label: "Certification 1",
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

  const updateCertificationAuthorityCertificationsHandler = fvae.mutation(
    "updateCertificationAuthorityForAdminCertificationsPage",
    graphQLResolver({
      certification_authority_updateCertificationAuthorityCertifications: {
        id: "c7399291-e79b-4e0f-b798-d3c97661e47f",
      },
    }),
  );

  const removeAllCertificationAuthorityCertificationsHandler = fvae.mutation(
    "removeAllCertificationAuthorityCertificationsForAdminCertificationsPage",
    graphQLResolver({
      certification_authority_removeAllCertificationAuthorityCertifications: true,
    }),
  );

  const getCertificationsHandler = fvae.query(
    "getCertifications",
    graphQLResolver({
      getCertifications: [
        {
          id: "cert-1",
          codeRncp: "RNCP12345",
          label: "Certification 1",
          level: 5,
        },
        {
          id: "cert-2",
          codeRncp: "RNCP67890",
          label: "Certification 2",
          level: 4,
        },
        {
          id: "cert-3",
          codeRncp: "RNCP11111",
          label: "Certification 3",
          level: 3,
        },
      ],
    }),
  );

  return [
    getCertificationAuthorityForCertificationsPageHandler,
    updateCertificationAuthorityCertificationsHandler,
    removeAllCertificationAuthorityCertificationsHandler,
    getCertificationsHandler,
  ];
};

const certificationsPageUrl =
  "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/";

const certificationAuthorityLabel = "certification authority label";

const removeAllCertificationsModalDescription = `Toutes les certifications gérées par ${certificationAuthorityLabel} seront retirées. Les parcours associés à ces certifications seront également détachés.`;

async function openAddCertificationsModal(page: Page) {
  const certificationsQuery = waitGraphQL(page, "getCertifications");

  await page
    .getByRole("button", { name: "Ajouter une liste de certifications" })
    .click();
  await certificationsQuery;

  return page.getByRole("dialog", {
    name: "Ajouter des certifications gérées",
  });
}

async function openRemoveAllCertificationsModal(page: Page) {
  await page
    .getByRole("button", { name: "Retirer toutes les certifications" })
    .click();

  return page.getByRole("dialog", {
    name: "Retirer toutes les certifications gérées",
  });
}

test.describe("Certification authority certifications page", () => {
  test.describe("when I access the certifications page", () => {
    test.use({
      mswHandlers: [
        [
          ...updateCertificationAuthorityCertificationsHandlers(),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });
    test("it shows the correct title", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
      );
      await waitForPageQueries(page);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Certifications gérées",
      );
    });

    test("it shows the correct description", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
      );
      await waitForPageQueries(page);

      await expect(
        page.getByText(
          "Ajouter toutes les certifications gérées depuis les certifications attribuées à la structure certificatrice. Vous pouvez ajouter une certification en dehors de la structure en utilisant l’option “afficher les certifications non gérées par la structure”.",
        ),
      ).toBeVisible();
    });
  });

  test.describe("when I use the certifications component", () => {
    test.describe("when there are certifications", () => {
      test.use({
        mswHandlers: [
          [
            ...updateCertificationAuthorityCertificationsHandlers(),
            ...aapCommonHandlers,
          ],
          { scope: "test" },
        ],
      });
      test("it shows the correct certifications list", async ({ page }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
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

      test("it let me add a certification to the certification authority", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
        );
        await waitForPageQueries(page);

        const mutationPromise = waitGraphQL(
          page,
          "updateCertificationAuthorityForAdminCertificationsPage",
        );

        await page
          .getByTestId("multi-select-list-item-cert-2")
          .getByRole("button", { name: "Ajouter" })
          .click();

        await mutationPromise;
      });

      test("it let me remove a certification from the certification authority", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
        );
        await waitForPageQueries(page);

        const mutationPromise = waitGraphQL(
          page,
          "updateCertificationAuthorityForAdminCertificationsPage",
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
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
        );
        await waitForPageQueries(page);

        const queryPromise = waitGraphQL(
          page,
          "getCertificationAuthorityForAdminCertificationsPage",
        );

        await page
          .getByRole("checkbox", {
            name: "Afficher les certifications ajoutées uniquement",
          })
          .click();

        await queryPromise;
      });

      test("it let me toggle the show all France VAE certifications switch", async ({
        page,
      }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
        );
        await waitForPageQueries(page);

        const queryPromise = waitGraphQL(
          page,
          "getCertificationAuthorityForAdminCertificationsPage",
        );

        await page
          .getByRole("checkbox", {
            name: "Afficher toutes les certifications France VAE",
          })
          .click();

        await queryPromise;
      });

      test("it let me search for a certification", async ({ page }) => {
        await login({ role: "admin", page });
        await page.goto(
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
        );
        await waitForPageQueries(page);

        const queryPromise = waitGraphQL(
          page,
          "getCertificationAuthorityForAdminCertificationsPage",
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
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
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
            ...updateCertificationAuthorityCertificationsHandlers({
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
          "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
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

  test.describe("when I remove all managed certifications", () => {
    test.use({
      mswHandlers: [
        [
          ...updateCertificationAuthorityCertificationsHandlers(),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("it shows the admin actions", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(certificationsPageUrl);
      await waitForPageQueries(page);

      await expect(
        page.getByRole("button", { name: "Ajouter une liste de certifications" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Retirer toutes les certifications" }),
      ).toBeVisible();
    });

    test("it hides the admin actions for a non-admin user", async ({
      page,
    }) => {
      await login({ role: "certificateur", page });
      await page.goto(certificationsPageUrl);
      await waitForPageQueries(page);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Certifications gérées",
      );
      await expect(
        page.getByRole("button", { name: "Ajouter une liste de certifications" }),
      ).not.toBeVisible();
      await expect(
        page.getByRole("button", { name: "Retirer toutes les certifications" }),
      ).not.toBeVisible();
    });

    test("it opens a confirmation modal", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(certificationsPageUrl);
      await waitForPageQueries(page);

      const modal = await openRemoveAllCertificationsModal(page);

      await expect(modal).toBeVisible();
      await expect(modal).toContainText(removeAllCertificationsModalDescription);
      await expect(modal).toContainText("Cette action est irréversible.");
      await expect(modal.getByRole("button", { name: "Annuler" })).toBeVisible();
      await expect(
        modal.getByRole("button", { name: "Retirer", exact: true }),
      ).toBeVisible();
    });

    test("it closes the modal without calling the mutation when clicking Annuler", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(certificationsPageUrl);
      await waitForPageQueries(page);

      const mutationRequests: string[] = [];
      page.on("request", (request) => {
        const postData = request.postData();
        if (
          postData?.includes(
            "removeAllCertificationAuthorityCertificationsForAdminCertificationsPage",
          )
        ) {
          mutationRequests.push(postData);
        }
      });

      const modal = await openRemoveAllCertificationsModal(page);
      await modal.getByRole("button", { name: "Annuler" }).click();

      await expect(modal).not.toBeVisible();
      expect(mutationRequests).toEqual([]);
    });

    test("it calls the mutation when clicking Retirer", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(certificationsPageUrl);
      await waitForPageQueries(page);

      const modal = await openRemoveAllCertificationsModal(page);

      const mutationPromise = waitGraphQL(
        page,
        "removeAllCertificationAuthorityCertificationsForAdminCertificationsPage",
      );

      await modal.getByRole("button", { name: "Retirer", exact: true }).click();

      const response = await mutationPromise;
      expect(response.request().postDataJSON()).toMatchObject({
        variables: {
          certificationAuthorityId: "c7399291-e79b-4e0f-b798-d3c97661e47f",
        },
      });

      await expect(modal).not.toBeVisible();
      await expect(page.getByTestId("toast-success")).toBeVisible();
      await expect(
        page.getByText("Les certifications gérées ont été supprimées"),
      ).toBeVisible();
    });
  });

  test.describe("when I add a list of certifications", () => {
    test.use({
      mswHandlers: [
        [
          ...updateCertificationAuthorityCertificationsHandlers(),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("it opens a modal to paste RNCP codes", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(certificationsPageUrl);
      await waitForPageQueries(page);

      const modal = await openAddCertificationsModal(page);

      await expect(modal).toBeVisible();
      await expect(modal).toContainText(
        `Les certifications saisies seront ajoutées à la liste des certifications gérées par ${certificationAuthorityLabel}.`,
      );
      await expect(
        modal.getByRole("textbox", { name: "Codes RNCP" }),
      ).toBeVisible();
      await expect(modal.getByRole("button", { name: "Annuler" })).toBeVisible();
      await expect(
        modal.getByRole("button", { name: "Ajouter", exact: true }),
      ).toBeDisabled();
    });

    test("it shows referenced and unknown RNCP codes", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(certificationsPageUrl);
      await waitForPageQueries(page);

      const modal = await openAddCertificationsModal(page);

      await modal
        .getByRole("textbox", { name: "Codes RNCP" })
        .fill("RNCP12345, 99999; rncp67890");

      await expect(modal).toContainText(
        "1 code(s) RNCP non référencé(s) sur 3 code(s)",
      );
      await expect(modal).toContainText(
        "Ils ne correspondent à aucune certification disponible sur France VAE. Vérifiez-les ou copiez-les pour les traiter à part.",
      );
      await expect(modal).toContainText(
        "2 code(s) RNCP référencé(s) sur 3 code(s)",
      );
      await expect(
        modal.getByTestId("add-certifications-copy-unknown-codes-button"),
      ).toBeVisible();
      await expect(
        modal.getByTestId("add-certifications-copy-matched-codes-button"),
      ).toBeVisible();
      await expect(
        modal.getByRole("button", { name: "Ajouter", exact: true }),
      ).toBeEnabled();
    });

    test("it keeps the add button disabled when no code matches", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(certificationsPageUrl);
      await waitForPageQueries(page);

      const modal = await openAddCertificationsModal(page);

      await modal.getByRole("textbox", { name: "Codes RNCP" }).fill("99999");

      await expect(modal).toContainText(
        "1 code(s) RNCP non référencé(s) sur 1 code(s)",
      );
      await expect(modal).toContainText(
        "0 code(s) RNCP référencé(s) sur 1 code(s)",
      );
      await expect(
        modal.getByTestId("add-certifications-copy-unknown-codes-button"),
      ).toBeVisible();
      await expect(
        modal.getByTestId("add-certifications-copy-matched-codes-button"),
      ).toHaveCount(0);
      await expect(
        modal.getByRole("button", { name: "Ajouter", exact: true }),
      ).toBeDisabled();
    });

    test("it copies unknown and referenced RNCP codes", async ({ page }) => {
      await page.context().grantPermissions([
        "clipboard-read",
        "clipboard-write",
      ]);
      await login({ role: "admin", page });
      await page.goto(certificationsPageUrl);
      await waitForPageQueries(page);

      const modal = await openAddCertificationsModal(page);

      await modal
        .getByRole("textbox", { name: "Codes RNCP" })
        .fill("RNCP12345, 99999; rncp67890");

      await modal
        .getByTestId("add-certifications-copy-unknown-codes-button")
        .click();

      await expect(page.getByText("Codes RNCP copiés")).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe("99999");

      await modal
        .getByTestId("add-certifications-copy-matched-codes-button")
        .click();

      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe("RNCP12345, RNCP67890");
    });

    test("it closes the modal without calling the mutation when clicking Annuler", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(certificationsPageUrl);
      await waitForPageQueries(page);

      const mutationRequests: string[] = [];
      page.on("request", (request) => {
        const postData = request.postData();
        if (
          postData?.includes(
            "updateCertificationAuthorityForAdminCertificationsPage",
          )
        ) {
          mutationRequests.push(postData);
        }
      });

      const modal = await openAddCertificationsModal(page);
      await modal
        .getByRole("textbox", { name: "Codes RNCP" })
        .fill("RNCP67890");
      await modal.getByRole("button", { name: "Annuler" }).click();

      await expect(modal).not.toBeVisible();
      expect(mutationRequests).toEqual([]);
    });

    test("it adds the referenced certifications", async ({ page }) => {
      await login({ role: "admin", page });
      await page.goto(certificationsPageUrl);
      await waitForPageQueries(page);

      const modal = await openAddCertificationsModal(page);
      await modal
        .getByRole("textbox", { name: "Codes RNCP" })
        .fill("RNCP12345, 99999; rncp67890");

      const mutationPromise = waitGraphQL(
        page,
        "updateCertificationAuthorityForAdminCertificationsPage",
      );

      await modal.getByRole("button", { name: "Ajouter", exact: true }).click();

      const response = await mutationPromise;
      expect(response.request().postDataJSON()).toMatchObject({
        variables: {
          certificationAuthorityId: "c7399291-e79b-4e0f-b798-d3c97661e47f",
          certificationIds: ["cert-1", "cert-2"],
        },
      });

      await expect(modal).not.toBeVisible();
      await expect(page.getByTestId("toast-success")).toBeVisible();
      await expect(
        page.getByText("Les certifications ont été ajoutées"),
      ).toBeVisible();
    });
  });

  test.describe("when I use the breadcrumb", () => {
    test.use({
      mswHandlers: [
        [
          ...updateCertificationAuthorityCertificationsHandlers(),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });
    test("it let me go back to the certification authority page", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
      );
      await waitForPageQueries(page);
      await page
        .locator(".fr-breadcrumb")
        .getByRole("link", { name: "certification authority label" })
        .click();
      await expect(page).toHaveURL(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
    });
    test("it let me go back to the certification authority structure page", async ({
      page,
    }) => {
      await login({ role: "admin", page });
      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
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
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/certifications/",
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
