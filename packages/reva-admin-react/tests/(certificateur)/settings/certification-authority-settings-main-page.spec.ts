import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";
import { graphQLResolver } from "../../shared/helpers/network/msw";
import { waitGraphQL } from "../../shared/helpers/network/requests";

const CERTIFICATION_AUTHORITY_ID = "c7399291-e79b-4e0f-b798-d3c97661e47f";

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers({
    certificationAuthorityId: CERTIFICATION_AUTHORITY_ID,
  });

const fvae = graphql.link("https://reva-api/api/graphql");

const certificationAuthoritySettingsWithContact = graphQLResolver({
  account_getAccountForConnectedUser: {
    certificationAuthority: {
      id: CERTIFICATION_AUTHORITY_ID,
      label: "certification authority label",
      contactFullName: "jane doe",
      contactEmail: "monemail@example.com",
      contactPhone: "0101010101",
      certificationAuthorityLocalAccounts: [
        {
          id: "4871a711-232b-4aba-aa5a-bc2adc51f869",
          contactEmail: null,
          account: {
            id: "81584efc-908b-4198-8424-4842926d4eaf",
            firstname: "firstname1",
            lastname: "lastname1",
            email: "email1@example.com",
          },
        },
        {
          id: "075ce4f4-8c94-4d64-9ca8-1dbaa6068eab",
          contactEmail: "contact2@example.com",
          account: {
            id: "9acb02c1-2e5c-43af-8f3f-d32ad687c131",
            firstname: "firstname2",
            lastname: "lastname2",
            email: "email2@example.com",
          },
        },
      ],
      certifications: [
        {
          id: "c051e8ad-f0f6-4132-9677-88b706489c8f",
          label: "BP Métallier",
          conventionsCollectives: [],
        },
        {
          id: "c8474d31-787d-43ef-98a1-9480a9669622",
          label: "Bac Professionnel Boulanger pâtissier",
          conventionsCollectives: [],
        },
      ],
    },
  },
});

const certificationAuthoritySettingsNoContact = graphQLResolver({
  account_getAccountForConnectedUser: {
    certificationAuthority: {
      id: CERTIFICATION_AUTHORITY_ID,
      label: "certification authority label",
      contactFullName: null,
      contactEmail: null,
      contactPhone: null,
      certificationAuthorityLocalAccounts: [
        {
          id: "4871a711-232b-4aba-aa5a-bc2adc51f869",
          contactEmail: null,
          account: {
            id: "81584efc-908b-4198-8424-4842926d4eaf",
            firstname: "firstname1",
            lastname: "lastname1",
            email: "email1@example.com",
          },
        },
        {
          id: "075ce4f4-8c94-4d64-9ca8-1dbaa6068eab",
          contactEmail: "contact2@example.com",
          account: {
            id: "9acb02c1-2e5c-43af-8f3f-d32ad687c131",
            firstname: "firstname2",
            lastname: "lastname2",
            email: "email2@example.com",
          },
        },
      ],
      certifications: [
        {
          id: "c051e8ad-f0f6-4132-9677-88b706489c8f",
          label: "BP Métallier",
          conventionsCollectives: [],
        },
        {
          id: "c8474d31-787d-43ef-98a1-9480a9669622",
          label: "Bac Professionnel Boulanger pâtissier",
          conventionsCollectives: [],
        },
      ],
    },
  },
});

test.describe("main page", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityForCertificationAuthoritySettingsPage",
          certificationAuthoritySettingsWithContact,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the settings page - display the page with a correct title", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    await expect(
      page.getByTestId("certification-authority-settings-page").locator("h1"),
    ).toHaveText("Paramètres");
  });
});

test.describe("general information summary card", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityForCertificationAuthoritySettingsPage",
          certificationAuthoritySettingsWithContact,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the settings page - display the general information summary card with the correct information", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    await expect(
      page.getByTestId("certification-authority-general-information-card"),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("certification-authority-general-information-card")
        .locator("h2"),
    ).toHaveText("Informations générales");
    await expect(
      page
        .getByTestId("certification-authority-general-information-card")
        .getByTestId("certification-authority-label"),
    ).toHaveText("certification authority label");
    await expect(
      page
        .getByTestId("certification-authority-general-information-card")
        .getByTestId("contact-full-name"),
    ).toHaveText("jane doe");
    await expect(
      page
        .getByTestId("certification-authority-general-information-card")
        .getByTestId("contact-email"),
    ).toHaveText("monemail@example.com");
    await expect(
      page
        .getByTestId("certification-authority-general-information-card")
        .getByTestId("contact-phone"),
    ).toHaveText("0101010101");
    await expect(
      page
        .getByTestId("certification-authority-general-information-card")
        .getByTestId("completed-badge"),
    ).toBeVisible();
  });

  test("shows a button to update the general information", async ({ page }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    const actionButton = page
      .getByTestId("certification-authority-general-information-card")
      .getByTestId("action-button");
    await expect(actionButton).toHaveText("Modifier");
    await expect(actionButton).toBeEnabled();
    await actionButton.click();
    await expect(page).toHaveURL(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/informations-generales/`,
    );
  });
});

test.describe("general information summary card - no contact info", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityForCertificationAuthoritySettingsPage",
          certificationAuthoritySettingsNoContact,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("should show a to complete badge when general information is missing", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    await expect(
      page
        .getByTestId("certification-authority-general-information-card")
        .getByTestId("to-complete-badge"),
    ).toBeVisible();
  });

  test("should show a no-contact-info badge when contact info is missing", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);
  });

  test("should show a no contact notice when contact info is missing", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    await expect(
      page
        .getByTestId("certification-authority-general-information-card")
        .getByTestId("no-contact-notice"),
    ).toBeVisible();
  });
});

test.describe("local accounts summary card", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityForCertificationAuthoritySettingsPage",
          certificationAuthoritySettingsWithContact,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the settings page - display the local accounts summary card", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    await expect(
      page
        .getByTestId("certification-authority-local-accounts-summary-card")
        .locator("h2"),
    ).toHaveText("Comptes locaux");
  });

  test("when i access the settings page - display 2 local accounts", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    const list = page.getByTestId(
      "certification-authority-local-accounts-summary-card-list",
    );
    await expect(list.locator("li")).toHaveCount(2);
  });

  test("when i access the settings page - display a warning badge when there is no contact email", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    const firstLi = page
      .getByTestId("certification-authority-local-accounts-summary-card-list")
      .locator("li")
      .first();
    await expect(
      firstLi.getByTestId("no-contact-referent-badge"),
    ).toBeVisible();
  });

  test("when i access the settings page - do not display a warning badge when there is a contact email", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    const lastLi = page
      .getByTestId("certification-authority-local-accounts-summary-card-list")
      .locator("li")
      .last();
    await expect(
      lastLi.getByTestId("no-contact-referent-badge"),
    ).not.toBeVisible();
  });

  test("when i click on the add button - redirect to the add local account page", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    await page
      .getByTestId("certification-authority-local-accounts-summary-card")
      .getByTestId("action-button")
      .click();
    await expect(page).toHaveURL(
      /\/certification-authorities\/[\w-]+\/settings\/local-accounts\/add-local-account/,
    );
  });

  test("when i click on the update button - redirect to the update local account page", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    await page
      .getByTestId("certification-authority-local-accounts-summary-card-list")
      .locator("li")
      .first()
      .getByTestId("update-local-account-button")
      .click();
    await expect(page).toHaveURL(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/`,
    );
  });
});

test.describe("certifications summary card", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityForCertificationAuthoritySettingsPage",
          certificationAuthoritySettingsWithContact,
        ),
        fvae.query(
          "getCertificationAuthorityForCertificationsPage",
          graphQLResolver({}),
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the settings page it should display the certifications summary card with the correct information", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    await expect(
      page.getByTestId("certifications-summary-card").locator("h2"),
    ).toHaveText("Certifications gérées");
    await expect(
      page
        .getByTestId("certifications-summary-card")
        .getByTestId("certifications-count-badge"),
    ).toHaveText("2 certifications gérées");
  });

  test("when i click on the 'consulter' button it should redirect to the certifications page", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      ),
    ]);

    await page
      .getByTestId("certifications-summary-card")
      .getByRole("button", { name: "Consulter" })
      .click();

    await expect(page).toHaveURL(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/certifications/`,
    );
  });
});
