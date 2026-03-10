import {
  expect,
  graphql,
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

const STRUCTURE_ID = "d529c770-70a5-43cb-90b2-9050c1d6a093";

const localAccountCertifications = graphQLResolver({
  account_getAccountForConnectedUser: {
    certificationAuthorityLocalAccount: {
      certificationAuthority: {
        certificationAuthorityStructures: [{ id: STRUCTURE_ID }],
      },
      paginatedCertifications: {
        rows: [
          {
            id: "00fa1e5b-1535-4cb6-b542-0dad27dd6341",
            codeRncp: "12296A",
            label: "CQP Animateur d'équipe autonome de production industrielle",
            visible: true,
            certificationAuthorityStructure: { id: STRUCTURE_ID },
          },
          {
            id: "0236bf82-e85d-4e88-927a-c93bb6c44efb",
            codeRncp: "5022",
            label:
              "Diplôme d'Etat Conseiller en économie sociale et familiale - DEESF",
            visible: true,
            certificationAuthorityStructure: { id: STRUCTURE_ID },
          },
        ],
        info: {
          totalRows: 2,
          totalPages: 1,
          currentPage: 1,
        },
      },
    },
  },
});

async function gotoCertificationsPage(page: import("@playwright/test").Page) {
  await login({ role: "certificateur", page });
  await page.goto(
    `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-account/certifications`,
  );
  await Promise.all([
    certificateurSettingsCommonWait(page),
    waitGraphQL(
      page,
      "getCertificationAuthorityLocalAccountForCertificationsLocalAccountPage",
    ),
  ]);
}

test.describe("local account settings certifications page", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForCertificationsLocalAccountPage",
          localAccountCertifications,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the certifications page - display the page with a correct title", async ({
    page,
  }) => {
    await gotoCertificationsPage(page);
    await expect(
      page
        .getByTestId("certifications-local-account-page")
        .locator("h1", { hasText: "Certifications gérées" }),
    ).toBeVisible();
  });

  test("when i access the certifications page - display the certifications list", async ({
    page,
  }) => {
    await gotoCertificationsPage(page);
    const pageContainer = page.getByTestId("certifications-local-account-page");
    await expect(
      pageContainer.getByTestId(
        "certification-card-00fa1e5b-1535-4cb6-b542-0dad27dd6341",
      ),
    ).toBeVisible();
    await expect(
      pageContainer.getByTestId(
        "certification-card-0236bf82-e85d-4e88-927a-c93bb6c44efb",
      ),
    ).toBeVisible();
    await expect(
      pageContainer.getByText(
        "CQP Animateur d'équipe autonome de production industrielle",
      ),
    ).toBeVisible();
    await expect(
      pageContainer.getByText(
        "Diplôme d'Etat Conseiller en économie sociale et familiale - DEESF",
      ),
    ).toBeVisible();
    await expect(pageContainer.getByText("RNCP 12296A")).toBeVisible();
    await expect(pageContainer.getByText("RNCP 5022")).toBeVisible();
  });

  test.describe("when i use the breadcrumb", () => {
    test("When i click on the 'Paramètres' link it redirects to the local account settings page", async ({
      page,
    }) => {
      await gotoCertificationsPage(page);
      await page
        .locator(".fr-breadcrumb")
        .getByRole("link", { name: "Paramètres" })
        .click();
      await expect(page).toHaveURL(
        new RegExp(
          `/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-account`,
        ),
      );
    });
  });
});
