import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";
import { graphQLResolver } from "../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../shared/helpers/network/requests";

const CERTIFICATION_AUTHORITY_ID = "c7399291-e79b-4e0f-b798-d3c97661e47f";

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers({
    certificationAuthorityId: CERTIFICATION_AUTHORITY_ID,
  });

const fvae = graphql.link("https://reva-api/api/graphql");

const localAccountWithContact = graphQLResolver({
  account_getAccountForConnectedUser: {
    certificationAuthorityLocalAccount: {
      contactFullName: "contact full name",
      contactEmail: "contact.email@example.com",
      departments: [
        {
          id: "0fd699b6-40c2-4ded-a29c-3417cded8b58",
          label: "Ain",
          code: "01",
          region: {
            id: "2946d835-f0fa-4c37-9a50-0735112395bd",
            label: "Auvergne-Rhône-Alpes",
          },
        },
        {
          id: "201a8192-50d9-42c0-9250-d98d80090c31",
          label: "Puy-de-Dôme",
          code: "63",
          region: {
            id: "2946d835-f0fa-4c37-9a50-0735112395bd",
            label: "Auvergne-Rhône-Alpes",
          },
        },
      ],
      certifications: [
        { id: "00fa1e5b-1535-4cb6-b542-0dad27dd6341" },
        { id: "0236bf82-e85d-4e88-927a-c93bb6c44efb" },
      ],
    },
  },
});

const localAccountNoContactDetails = graphQLResolver({
  account_getAccountForConnectedUser: {
    certificationAuthorityLocalAccount: {
      contactFullName: null,
      contactEmail: null,
      departments: [],
      certifications: [],
    },
  },
});

async function gotoLocalAccountSettingsPage(
  page: import("@playwright/test").Page,
) {
  await login({ role: "certificateur", page });
  await page.goto(
    `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-account`,
  );
  await Promise.all([
    certificateurSettingsCommonWait(page),
    waitGraphQL(
      page,
      "getCertificationAuthorityLocalAccountForCertificationAuthorityLocalAccountSettingsPage",
    ),
  ]);
}

test.describe("main page", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForCertificationAuthorityLocalAccountSettingsPage",
          localAccountWithContact,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the local account settings page - display the page with a correct title", async ({
    page,
  }) => {
    await gotoLocalAccountSettingsPage(page);
    await expect(
      page
        .getByTestId("local-account-settings-page")
        .locator("h1", { hasText: "Paramètres" }),
    ).toBeVisible();
  });
});

test.describe("general information summary card - with contact details", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForCertificationAuthorityLocalAccountSettingsPage",
          localAccountWithContact,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the local account settings page - display the general information summary card with the correct information", async ({
    page,
  }) => {
    await gotoLocalAccountSettingsPage(page);

    const localAccountGeneralInformationSummaryCard = page.getByTestId(
      "local-account-general-information-summary-card",
    );
    await expect(localAccountGeneralInformationSummaryCard).toBeVisible();
    await expect(
      localAccountGeneralInformationSummaryCard.locator("h2"),
    ).toHaveText("Informations générales");
    await expect(
      localAccountGeneralInformationSummaryCard.getByTestId(
        "contact-full-name",
      ),
    ).toHaveText("contact full name");
    await expect(
      localAccountGeneralInformationSummaryCard.getByTestId("contact-email"),
    ).toHaveText("contact.email@example.com");
  });

  test("when i click on the update button - redirect to the general information page", async ({
    page,
  }) => {
    await gotoLocalAccountSettingsPage(page);
    await page
      .getByTestId("local-account-general-information-summary-card")
      .getByTestId("action-button")
      .click();
    await expect(page).toHaveURL(
      new RegExp(
        `/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-account/general-information`,
      ),
    );
  });
});

test.describe("general information summary card - no contact details", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForCertificationAuthorityLocalAccountSettingsPage",
          localAccountNoContactDetails,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the local account settings page with no contact details - display the no-contact-details badge", async ({
    page,
  }) => {
    await gotoLocalAccountSettingsPage(page);
    await expect(page.getByTestId("no-contact-details-badge")).toBeVisible();
  });
});

test.describe("intervention area summary card", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForCertificationAuthorityLocalAccountSettingsPage",
          localAccountWithContact,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the local account settings page - display the intervention area summary card with the correct information", async ({
    page,
  }) => {
    await gotoLocalAccountSettingsPage(page);
    const interventionAreaSummaryCard = page.getByTestId(
      "intervention-area-summary-card",
    );
    await expect(interventionAreaSummaryCard).toBeVisible();
    await expect(interventionAreaSummaryCard.locator("h2")).toHaveText(
      "Zone d'intervention",
    );
    await interventionAreaSummaryCard.locator(".fr-accordion").click();
    await expect(
      interventionAreaSummaryCard.getByTestId("department-tag-01"),
    ).toBeVisible();
    await expect(
      interventionAreaSummaryCard.getByTestId("department-tag-63"),
    ).toBeVisible();
  });
});

test.describe("certifications summary card", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForCertificationAuthorityLocalAccountSettingsPage",
          localAccountWithContact,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the local account settings page - display the certifications summary card with the correct count", async ({
    page,
  }) => {
    await gotoLocalAccountSettingsPage(page);
    const certificationsSummaryCard = page.getByTestId(
      "certifications-summary-card",
    );
    await expect(certificationsSummaryCard).toBeVisible();
    await expect(certificationsSummaryCard.locator("h2")).toHaveText(
      "Certifications gérées",
    );
    await expect(
      certificationsSummaryCard.getByTestId("certifications-count-badge"),
    ).toHaveText("2 certifications gérées");
  });

  test("when i click on the certifications action button - redirect to the certifications page", async ({
    page,
  }) => {
    await gotoLocalAccountSettingsPage(page);
    await page
      .getByTestId("certifications-summary-card")
      .getByTestId("action-button")
      .click();
    await expect(page).toHaveURL(
      new RegExp(
        `/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-account/certifications`,
      ),
    );
  });
});
