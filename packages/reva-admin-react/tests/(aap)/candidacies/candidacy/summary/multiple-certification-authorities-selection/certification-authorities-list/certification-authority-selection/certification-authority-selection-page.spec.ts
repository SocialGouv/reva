import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../../../../shared/helpers/network/requests";

import type { Page } from "next/experimental/testmode/playwright/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";
const CERTIFICATION_AUTHORITY_ID = "cert-auth-1";

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

const DEFAULT_CERTIFICATION_AUTHORITY = {
  id: CERTIFICATION_AUTHORITY_ID,
  label: "Autorité Certificatrice Test",
  contactFullName: "Marie Dupont",
  contactEmail: "cert@example.com",
  contactPhone: "0123456789",
};

const createHandlers = (
  certificationAuthority: {
    id: string;
    label: string;
    contactFullName: string;
    contactEmail: string | null;
    contactPhone: string | null;
  } | null = DEFAULT_CERTIFICATION_AUTHORITY,
) => [
  fvae.query(
    "getCertificationAuthorityForSelectionPage",
    graphQLResolver({
      certification_authority_getCertificationAuthority: certificationAuthority,
    }),
  ),
];

const goToCertificationAuthorityDetailsPage = async (page: Page) => {
  await login({ role: "aap", page });
  await page.goto(
    `/admin2/candidacies/${CANDIDACY_ID}/summary/multiple-certification-authorities-selection/certification-authorities-list/certification-authority-selection/${CERTIFICATION_AUTHORITY_ID}/`,
  );
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(page, "getCertificationAuthorityForSelectionPage"),
  ]);
};

test.describe("Certification authority selection page (multiple certification authorities selection)", () => {
  test.describe("with a certification authority", () => {
    test.use({
      mswHandlers: [
        [...createHandlers(), ...aapCommonHandlers],
        { scope: "test" },
      ],
    });

    test("should display the page title and description", async ({ page }) => {
      await goToCertificationAuthorityDetailsPage(page);

      await expect(
        page.getByRole("heading", { name: "Certificateur" }),
      ).toBeVisible();
      await expect(
        page.getByText(
          "Le certificateur étudiera les dossiers de faisabilité et de validation de cette candidature.",
        ),
      ).toBeVisible();
    });

    test("should display the certification authority card with its contact information", async ({
      page,
    }) => {
      await goToCertificationAuthorityDetailsPage(page);

      const card = page.getByTestId("certification-authority-card");
      await expect(card).toBeVisible();
      await expect(card).toContainText(DEFAULT_CERTIFICATION_AUTHORITY.label);
      await expect(card).toContainText(
        DEFAULT_CERTIFICATION_AUTHORITY.contactEmail,
      );
      await expect(card).toContainText(
        DEFAULT_CERTIFICATION_AUTHORITY.contactPhone,
      );
    });

    test("should lead me back to the certification authorities list when I click on the 'Retour' button", async ({
      page,
    }) => {
      await goToCertificationAuthorityDetailsPage(page);

      await page.getByRole("link", { name: "Retour" }).click();

      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/summary/multiple-certification-authorities-selection/certification-authorities-list/`,
      );
    });
  });

  test.describe("without a certification authority", () => {
    test.use({
      mswHandlers: [
        [...createHandlers(null), ...aapCommonHandlers],
        { scope: "test" },
      ],
    });

    test("should not display the certification authority card", async ({
      page,
    }) => {
      await goToCertificationAuthorityDetailsPage(page);

      await expect(
        page.getByTestId("certification-authority-card"),
      ).not.toBeVisible();
    });
  });
});
