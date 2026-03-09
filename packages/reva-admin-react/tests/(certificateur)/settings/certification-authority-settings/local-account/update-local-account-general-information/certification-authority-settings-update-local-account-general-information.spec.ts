import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";
import { graphQLResolver } from "../../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../../shared/helpers/network/requests";

const CERTIFICATION_AUTHORITY_ID = "c7399291-e79b-4e0f-b798-d3c97661e47f";
const LOCAL_ACCOUNT_ID = "4871a711-232b-4aba-aa5a-bc2adc51f869";

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers({
    certificationAuthorityId: CERTIFICATION_AUTHORITY_ID,
  });

const fvae = graphql.link("https://reva-api/api/graphql");

const localAccountForGeneralInfo = graphQLResolver({
  certification_authority_getCertificationAuthorityLocalAccount: {
    id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
    account: {
      firstname: "jane",
      lastname: "doe",
      email: "monemail@example.com",
    },
    contactFullName: "contact full name",
    contactEmail: "contact@example.com",
    contactPhone: "0123456789",
    certificationAuthority: { label: "Certification Authority" },
    departments: [],
    certifications: [],
  },
});

const updateGeneralInfoMutationResponse = graphQLResolver({
  certification_authority_updateCertificationAuthorityLocalAccount: {
    id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
  },
});

test.describe("update local account general information page", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
          localAccountForGeneralInfo,
        ),
        fvae.mutation(
          "updateCertificationAuthorityLocalAccountGeneralInformationForUpdateLocalAccountGeneralInformationPage",
          updateGeneralInfoMutationResponse,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the update local account general information page - display the page with a correct title", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-accounts/${LOCAL_ACCOUNT_ID}/general-information`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
      ),
    ]);

    await expect(
      page
        .getByTestId(
          "update-certification-authority-local-account-general-information-page",
        )
        .locator("h1", { hasText: "Informations générales" }),
    ).toBeVisible();
  });

  test("when i access the update local account general information page - display the correct form default values", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-accounts/${LOCAL_ACCOUNT_ID}/general-information`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
      ),
    ]);

    const pageRoot = page.getByTestId(
      "update-certification-authority-local-account-general-information-page",
    );
    await expect(
      pageRoot
        .getByTestId("certification-authority-label-input")
        .locator("input"),
    ).toHaveValue("Certification Authority");
    await expect(
      pageRoot.getByTestId("account-lastname-input").locator("input"),
    ).toHaveValue("doe");
    await expect(
      pageRoot.getByTestId("account-firstname-input").locator("input"),
    ).toHaveValue("jane");
    await expect(
      pageRoot.getByTestId("account-email-input").locator("input"),
    ).toHaveValue("monemail@example.com");
    await expect(
      pageRoot.getByTestId("contact-full-name-input").locator("input"),
    ).toHaveValue("contact full name");
    await expect(
      pageRoot.getByTestId("contact-email-input").locator("input"),
    ).toHaveValue("contact@example.com");
    await expect(
      pageRoot.getByTestId("contact-phone-input").locator("input"),
    ).toHaveValue("0123456789");
  });

  test("when i access the update local account general information page - do not let me click on the submit button if there is no changes", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-accounts/${LOCAL_ACCOUNT_ID}/general-information`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
      ),
    ]);

    await expect(
      page
        .getByTestId(
          "update-certification-authority-local-account-general-information-page",
        )
        .locator("button[type='submit']"),
    ).toBeDisabled();
  });

  test("when i access the update local account general information page - let me change the contact fields and submit the form", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-accounts/${LOCAL_ACCOUNT_ID}/general-information`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
      ),
    ]);

    const pageRoot = page.getByTestId(
      "update-certification-authority-local-account-general-information-page",
    );
    await pageRoot
      .getByTestId("contact-full-name-input")
      .locator("input")
      .fill("new contact full name");
    await pageRoot
      .getByTestId("contact-email-input")
      .locator("input")
      .fill("newcontact.email@example.com");
    await pageRoot
      .getByTestId("contact-phone-input")
      .locator("input")
      .fill("9999999999");

    const mutationPromise = waitGraphQL(
      page,
      "updateCertificationAuthorityLocalAccountGeneralInformationForUpdateLocalAccountGeneralInformationPage",
    );
    await pageRoot.locator("button[type='submit']").click();
    await mutationPromise;

    await expect(page).toHaveURL(
      new RegExp(
        `/certification-authorities/[\\w-]+/settings/local-accounts/${LOCAL_ACCOUNT_ID}/`,
      ),
    );
  });
});
