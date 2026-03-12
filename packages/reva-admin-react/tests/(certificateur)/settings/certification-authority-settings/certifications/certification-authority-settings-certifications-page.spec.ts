import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const CERTIFICATION_AUTHORITY_ID = "c7399291-e79b-4e0f-b798-d3c97661e47f";

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers({
    certificationAuthorityId: CERTIFICATION_AUTHORITY_ID,
  });

const fvae = graphql.link("https://reva-api/api/graphql");

const createCertificationsHandlers = () => {
  const getCertificationAuthorityForCertificationsPageHandler = fvae.query(
    "getCertificationAuthorityForCertificationsPage",
    graphQLResolver({
      data: {
        account_getAccountForConnectedUser: {
          certificationAuthority: {
            certificationAuthorityStructures: [
              {
                id: "d529c770-70a5-43cb-90b2-9050c1d6a093",
              },
            ],
            id: CERTIFICATION_AUTHORITY_ID,
            label: "Certificateur",
            certificationsAndParcours: {
              rows: [
                {
                  certification: {
                    certificationAuthorityStructure: {
                      id: "d529c770-70a5-43cb-90b2-9050c1d6a093",
                    },
                    id: "1",
                    codeRncp: "12296A",
                    label:
                      "Bac Pro Accompagnement, soins et services à la personne - à domicile",
                    visible: true,
                    parcours: {
                      info: {
                        totalRows: 0,
                      },
                    },
                  },
                  parcours: [],
                },
                {
                  certification: {
                    certificationAuthorityStructure: {
                      id: "d529c770-70a5-43cb-90b2-9050c1d6a093",
                    },
                    id: "2",
                    codeRncp: "5022",
                    label:
                      "Autre certification professionnelle de droit - Un des meilleurs ouvriers de France (diplôme d'Etat)  Groupe III Métiers du bâtiment,des travaux publics et du patrimoine architectural      Spécialité : métiers du verre appliqués à l'architecture",
                    visible: true,
                    parcours: {
                      info: {
                        totalRows: 1,
                      },
                    },
                  },
                  parcours: [
                    {
                      id: "6a1b78c3-561e-46f3-ade8-3324251b03a1",
                    },
                  ],
                },
                {
                  certification: {
                    certificationAuthorityStructure: {
                      id: "d529c770-70a5-43cb-90b2-9050c1d6a093",
                    },
                    id: "3",
                    codeRncp: "9999",
                    label: "Certification avec parcours non sélectionnés",
                    visible: true,
                    parcours: {
                      info: {
                        totalRows: 2,
                      },
                    },
                  },
                  parcours: [],
                },
              ],
              info: {
                totalRows: 3,
                totalPages: 1,
                currentPage: 1,
              },
            },
          },
        },
      },
    }),
  );

  const getCertificationAndParcoursForCertificationAuthorityParcoursPageHandler =
    fvae.query(
      "getCertificationAndParcoursForCertificationAuthorityParcoursPageQuery",
      graphQLResolver({
        data: {
          getCertificationAndParcoursForCertificationAuthorityParcoursPage: {
            certification: {
              id: "1",
              label:
                "Bac Pro Accompagnement, soins et services à la personne - à domicile",
              parcours: {
                rows: [],
              },
            },
          },
        },
      }),
    );
  return [
    getCertificationAuthorityForCertificationsPageHandler,
    getCertificationAndParcoursForCertificationAuthorityParcoursPageHandler,
  ];
};

async function waitForPageQueries(page: Page) {
  await Promise.all([
    certificateurSettingsCommonWait(page),
    waitGraphQL(page, "getCertificationAuthorityForCertificationsPage"),
  ]);
}

test.describe("certification authority settings certifications page", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        ...createCertificationsHandlers(),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the certifications page - display the page with a correct title", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/certifications`,
    );
    await waitForPageQueries(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Certifications gérées",
    );
  });
  test.describe("When a certification has no parcours", () => {
    test("it let me click on the card and redirect me to the certification details page", async ({
      page,
    }) => {
      await login({ role: "certificateur", page });
      await page.goto(
        `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/certifications`,
      );
      await waitForPageQueries(page);
      await page.getByTestId("certification-card-1").click();
      await expect(page).toHaveURL("/admin2/certification-details/1/");
    });
  });

  test.describe("When a certification has a parcours", () => {
    test("it displays the parcours count badge when the CA has parcours linked to the certification", async ({
      page,
    }) => {
      await login({ role: "certificateur", page });
      await page.goto(
        `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/certifications`,
      );
      await waitForPageQueries(page);
      await expect(
        page.getByTestId("certification-card-2").getByText("1 PARCOURS"),
      ).toBeVisible();
    });

    test("it does not display the parcours count badge when the CA has no parcours linked to the certification", async ({
      page,
    }) => {
      await login({ role: "certificateur", page });
      await page.goto(
        `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/certifications`,
      );
      await waitForPageQueries(page);
      await expect(
        page.getByTestId("certification-card-3").getByText(/PARCOURS/),
      ).not.toBeVisible();
    });

    test("it let me click on the 'Voir la fiche' button and redirect me to the certification details page", async ({
      page,
    }) => {
      await login({ role: "certificateur", page });
      await page.goto(
        `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/certifications`,
      );
      await waitForPageQueries(page);
      await page

        .getByTestId("certification-card-2")
        .getByRole("link", { name: "Voir la fiche" })
        .click();
      await expect(page).toHaveURL("/admin2/certification-details/2/");
    });

    test("it let me click on the 'Paramétrer' button and redirect me to the certification parcours page", async ({
      page,
    }) => {
      await login({ role: "certificateur", page });
      await page.goto(
        `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/certifications/`,
      );
      await waitForPageQueries(page);
      await page

        .getByTestId("certification-card-2")
        .getByRole("link", { name: "Paramétrer" })
        .click();
      await expect(page).toHaveURL(
        `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/certifications/2/parcours/`,
      );
    });
  });
});
