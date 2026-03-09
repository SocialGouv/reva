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

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers({
    certificationAuthorityId: CERTIFICATION_AUTHORITY_ID,
  });

const fvae = graphql.link("https://reva-api/api/graphql");

const certificationAuthorityForAdd = graphQLResolver({
  account_getAccountForConnectedUser: {
    certificationAuthority: {
      id: CERTIFICATION_AUTHORITY_ID,
      label: "certification authority label",
    },
  },
});

const addLocalAccountMutationResponse = graphQLResolver({
  certification_authority_createCertificationAuthorityLocalAccount: {
    id: "f7b5b065-f1c5-47d3-aa0c-c826deee8fa6",
  },
});

test.describe("add local account general information page", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityForAddLocalAccountGeneralInformationPage",
          certificationAuthorityForAdd,
        ),
        fvae.mutation(
          "addCertificationAuthorityLocalAccountGeneralInformationForAddLocalAccountGeneralInformationPage",
          addLocalAccountMutationResponse,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the add local account general information page - display the page with a correct title", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-accounts/add-local-account/general-information`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForAddLocalAccountGeneralInformationPage",
      ),
    ]);

    await expect(
      page
        .getByTestId(
          "add-certification-authority-local-account-general-information-page",
        )
        .locator("h1", { hasText: "Informations générales" }),
    ).toBeVisible();
  });

  test("when i access the add local account general information page - let me fill the fields and submit the form", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-accounts/add-local-account/general-information`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityForAddLocalAccountGeneralInformationPage",
      ),
    ]);

    const pageRoot = page.getByTestId(
      "add-certification-authority-local-account-general-information-page",
    );
    await pageRoot
      .getByTestId("account-lastname-input")
      .locator("input")
      .fill("new account last name");
    await pageRoot
      .getByTestId("account-firstname-input")
      .locator("input")
      .fill("new account first name");
    await pageRoot
      .getByTestId("account-email-input")
      .locator("input")
      .fill("newaccount.email@example.com");
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
      "addCertificationAuthorityLocalAccountGeneralInformationForAddLocalAccountGeneralInformationPage",
    );
    await pageRoot.locator("button[type='submit']").click();
    await mutationPromise;

    await expect(page).toHaveURL(
      `/admin2/certification-authorities/${CERTIFICATION_AUTHORITY_ID}/settings/local-accounts/f7b5b065-f1c5-47d3-aa0c-c826deee8fa6/`,
    );
  });
});
