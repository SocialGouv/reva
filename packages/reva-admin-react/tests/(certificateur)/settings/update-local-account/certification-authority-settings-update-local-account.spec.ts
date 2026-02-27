import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";
import { graphQLResolver } from "../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../shared/helpers/network/requests";

const LOCAL_ACCOUNT_ID = "4871a711-232b-4aba-aa5a-bc2adc51f869";
const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers();

const fvae = graphql.link("https://reva-api/api/graphql");

const localAccountWithContact = graphQLResolver({
  certification_authority_getCertificationAuthorityLocalAccount: {
    id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
    account: {
      firstname: "jane",
      lastname: "doe",
      email: "monemail@example.com",
    },
    contactFullName: "contact full name",
    contactEmail: "contact.email@example.com",
    contactPhone: "0123456789",

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
      {
        id: "00fa1e5b-1535-4cb6-b542-0dad27dd6341",
        label: "CQP Animateur d'équipe autonome de production industrielle",
        conventionsCollectives: [
          { id: "3af3e807-9848-4e27-b71a-1fb210aac1ef", label: "Métallurgie" },
        ],
      },
      {
        id: "0236bf82-e85d-4e88-927a-c93bb6c44efb",
        label:
          "Diplôme d'Etat Conseiller en économie sociale et familiale - DEESF",
        conventionsCollectives: [],
      },
    ],
  },
});

const localAccountNoContactDetails = graphQLResolver({
  certification_authority_getCertificationAuthorityLocalAccount: {
    id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
    account: {
      firstname: "jane",
      lastname: "doe",
      email: "monemail@example.com",
    },
    contactFullName: null,
    contactEmail: null,
    contactPhone: null,
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
      {
        id: "00fa1e5b-1535-4cb6-b542-0dad27dd6341",
        label: "CQP Animateur d'équipe autonome de production industrielle",
        conventionsCollectives: [
          { id: "3af3e807-9848-4e27-b71a-1fb210aac1ef", label: "Métallurgie" },
        ],
      },
      {
        id: "0236bf82-e85d-4e88-927a-c93bb6c44efb",
        label:
          "Diplôme d'Etat Conseiller en économie sociale et familiale - DEESF",
        conventionsCollectives: [],
      },
    ],
  },
});

const deleteLocalAccountResponse = graphQLResolver({
  certification_authority_deleteCertificationAuthorityLocalAccount: {
    id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
  },
});

async function gotoUpdateLocalAccount(page: import("@playwright/test").Page) {
  await login({ role: "certificateur", page });
  await page.goto(
    `/admin2/certification-authorities/settings/local-accounts/${LOCAL_ACCOUNT_ID}`,
  );
  await Promise.all([
    certificateurSettingsCommonWait(page),
    waitGraphQL(
      page,
      "getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
    ),
  ]);
}

test.describe("update local account page", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          localAccountWithContact,
        ),
        fvae.mutation(
          "deleteCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          deleteLocalAccountResponse,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the update local account page - display the page with a correct title", async ({
    page,
  }) => {
    await gotoUpdateLocalAccount(page);
    await expect(
      page
        .getByTestId("update-certification-authority-local-account-page")
        .locator("h1", { hasText: "jane doe" }),
    ).toBeVisible();
  });
});

test.describe("general information summary card", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          localAccountWithContact,
        ),
        fvae.mutation(
          "deleteCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          deleteLocalAccountResponse,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the update local account page - display the general information summary card with the correct information", async ({
    page,
  }) => {
    await gotoUpdateLocalAccount(page);
    await expect(
      page.getByTestId("local-account-general-information-summary-card"),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("local-account-general-information-summary-card")
        .locator("h2"),
    ).toHaveText("Informations générales");
    await expect(
      page
        .getByTestId("local-account-general-information-summary-card")
        .getByTestId("contact-full-name"),
    ).toHaveText("contact full name");
    await expect(
      page
        .getByTestId("local-account-general-information-summary-card")
        .getByTestId("contact-email"),
    ).toHaveText("contact.email@example.com");
  });

  test("when i click on the update button - redirect to the update general information page", async ({
    page,
  }) => {
    await gotoUpdateLocalAccount(page);
    await page
      .getByTestId("local-account-general-information-summary-card")
      .getByTestId("action-button")
      .click();
    await expect(page).toHaveURL(
      new RegExp(
        `/certification-authorities/settings/local-accounts/${LOCAL_ACCOUNT_ID}/general-information`,
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
          "getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          localAccountNoContactDetails,
        ),
        fvae.mutation(
          "deleteCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          deleteLocalAccountResponse,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the update local account page with no contact details - display the no-contact-details badge", async ({
    page,
  }) => {
    await gotoUpdateLocalAccount(page);
    await expect(page.getByTestId("no-contact-details-badge")).toBeVisible();
  });
});

test.describe("intervention area summary card", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          localAccountWithContact,
        ),
        fvae.mutation(
          "deleteCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          deleteLocalAccountResponse,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the update local account page - display the intervention area summary card with the correct information", async ({
    page,
  }) => {
    await gotoUpdateLocalAccount(page);
    await expect(
      page.getByTestId("intervention-area-summary-card"),
    ).toBeVisible();
    await expect(
      page.getByTestId("intervention-area-summary-card").locator("h2"),
    ).toHaveText("Zone d'intervention");
    await page
      .getByTestId("intervention-area-summary-card")
      .locator(".fr-accordion")
      .click();
    await expect(page.getByTestId("department-tag-01")).toBeVisible();
    await expect(page.getByTestId("department-tag-63")).toBeVisible();
  });

  test("when i click on the update button - redirect to the update intervention area page", async ({
    page,
  }) => {
    await gotoUpdateLocalAccount(page);
    await page
      .getByTestId("intervention-area-summary-card")
      .getByTestId("action-button")
      .click();
    await expect(page).toHaveURL(
      new RegExp(
        `/certification-authorities/settings/local-accounts/${LOCAL_ACCOUNT_ID}/intervention-area`,
      ),
    );
  });
});

test.describe("certifications summary card", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          localAccountWithContact,
        ),
        fvae.mutation(
          "deleteCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          deleteLocalAccountResponse,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the update local account page - display the certifications summary card with the correct information", async ({
    page,
  }) => {
    await gotoUpdateLocalAccount(page);
    await expect(page.getByTestId("certifications-summary-card")).toBeVisible();
    await expect(
      page.getByTestId("certifications-summary-card").locator("h2"),
    ).toHaveText("Certifications gérées");
    await expect(
      page
        .getByTestId("certifications-summary-card")
        .getByTestId("certifications-count-badge"),
    ).toHaveText("2 certifications gérées");
  });

  test("when i click on the update button - redirect to the update certifications page", async ({
    page,
  }) => {
    await gotoUpdateLocalAccount(page);
    await page
      .getByTestId("certifications-summary-card")
      .getByTestId("action-button")
      .click();
    await expect(page).toHaveURL(
      new RegExp(
        `/certification-authorities/settings/local-accounts/${LOCAL_ACCOUNT_ID}/certifications`,
      ),
    );
  });
});

test.describe("delete button", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          localAccountWithContact,
        ),
        fvae.mutation(
          "deleteCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
          deleteLocalAccountResponse,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the update local account page - display the delete button", async ({
    page,
  }) => {
    await gotoUpdateLocalAccount(page);
    await expect(
      page.getByTestId("delete-certification-authority-local-account-button"),
    ).toBeVisible();
  });
});
