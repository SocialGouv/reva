import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";
import { graphQLResolver } from "../../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../../shared/helpers/network/requests";

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers();

const fvae = graphql.link("https://reva-api/api/graphql");

const createParcoursCertificationHandlers = () => {
  const getCertificationAndParcoursForCertificationAuthorityParcoursPageHandler =
    fvae.query(
      "getCertificationAndParcoursForCertificationAuthorityParcoursPageQuery",
      graphQLResolver({
        data: {
          getCertification: {
            id: "1",
            label: "Certification 1",
            parcours: {
              rows: [
                {
                  id: "1",
                  label: "Parcours 1",
                  nomEtablissement: "Etablissement 1",
                },
              ],
              info: {
                totalRows: 1,
                totalPages: 1,
              },
            },
          },
        },
      }),
    );

  const getCertificationAuthorityForCertificationsPageHandler = fvae.query(
    "getCertificationAuthorityForCertificationsPage",
    graphQLResolver({
      data: {},
    }),
  );
  return [
    getCertificationAndParcoursForCertificationAuthorityParcoursPageHandler,
    getCertificationAuthorityForCertificationsPageHandler,
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

test.use({
  mswHandlers: [
    [
      ...certificateurSettingsCommonHandlers,
      ...createParcoursCertificationHandlers(),
    ],
    { scope: "test" },
  ],
});

test.use({
  mswHandlers: [
    [
      ...certificateurSettingsCommonHandlers,
      ...createParcoursCertificationHandlers(),
    ],
    { scope: "test" },
  ],
});

test.describe("when i access the parcours certification page", () => {
  test("it should display the page with a correct title", async ({ page }) => {
    await login({ page, role: "certificateur" });

    await page.goto(
      "/admin2/certification-authorities/settings/certifications/1/parcours",
    );

    await waitForPageQueries(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Certification 1",
    );
  });
});

test.describe("breadcrumb", async () => {
  test("when i click on the 'certifications gérées' link it should lead to the certifications page", async ({
    page,
  }) => {
    await login({ page, role: "certificateur" });

    await page.goto(
      "/admin2/certification-authorities/settings/certifications/1/parcours",
    );

    await waitForPageQueries(page);

    await page
      .locator(".fr-breadcrumb")
      .getByRole("link", { name: "Certifications gérées" })
      .click();

    await expect(page).toHaveURL(
      "/admin2/certification-authorities/settings/certifications/",
    );
  });

  test("when i click on the 'Paramètres' link it should lead to the settings page", async ({
    page,
  }) => {
    await login({ page, role: "certificateur" });

    await page.goto(
      "/admin2/certification-authorities/settings/certifications/1/parcours",
    );

    await waitForPageQueries(page);

    await page
      .locator(".fr-breadcrumb")
      .getByRole("link", { name: "Paramètres" })
      .click();

    await expect(page).toHaveURL("/admin2/certification-authorities/settings/");
  });
});
