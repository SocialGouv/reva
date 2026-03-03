import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const LOCAL_ACCOUNT_ID = "4871a711-232b-4aba-aa5a-bc2adc51f869";
const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers();

const fvae = graphql.link("https://reva-api/api/graphql");

const STRUCTURE_ID = "structure-1";
const localAccountForCertifications = graphQLResolver({
  certification_authority_getCertificationAuthorityLocalAccount: {
    id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
    account: {
      firstname: "jane",
      lastname: "doe",
      email: "monemail@example.com",
    },
    certificationAuthority: {
      label: "Certification Authority",
      certificationAuthorityStructures: [{ id: STRUCTURE_ID }],
      paginatedCertifications: {
        rows: [
          {
            id: "00fa1e5b-1535-4cb6-b542-0dad27dd6341",
            label: "CQP Animateur d'équipe autonome de production industrielle",
            codeRncp: "37310",
            visible: true,
            certificationAuthorityStructure: { id: STRUCTURE_ID },
          },
          {
            id: "0236bf82-e85d-4e88-927a-c93bb6c44efb",
            label:
              "Diplôme d'Etat Conseiller en économie sociale et familiale - DEESF",
            codeRncp: "49872",
            visible: true,
            certificationAuthorityStructure: { id: STRUCTURE_ID },
          },
          {
            id: "032036b5-528e-4d06-bbe0-a7d180602bc1",
            label: "Titre professionnel Cariste d'entrepôt - CE ",
            codeRncp: "13247",
            visible: true,
            certificationAuthorityStructure: { id: STRUCTURE_ID },
          },
        ],
        info: {
          totalRows: 3,
          totalPages: 1,
        },
      },
    },
    certifications: [{ id: "0236bf82-e85d-4e88-927a-c93bb6c44efb" }],
  },
});

const updateCertificationsMutationResponse = graphQLResolver({
  certification_authority_updateCertificationAuthorityLocalAccountCertifications:
    {
      id: "b4e996de-be53-4d1d-b8fb-879b9e75d450",
      certifications: [
        {
          id: "7c4ce27e-b0ac-4c95-92aa-476c913adf5c",
          label: "BTS Fonderie",
          codeRncp: "37310",
        },
        {
          id: "7ad608c2-5a4b-40eb-8ef9-7a85421b40f0",
          label: "BTS Pilotage de procédés - PP",
          codeRncp: "50410",
        },
        {
          id: "dcee4c57-e7fe-47a9-bdb2-ec479880cfdf",
          label:
            "Titre à finalité professionnelle Conducteur accompagnateur de personnes à mobilité réduite - CAPMR",
          codeRncp: "48781",
        },
      ],
    },
});

test.describe("update local account certifications page", () => {
  test.use({
    mswHandlers: [
      [
        ...certificateurSettingsCommonHandlers,
        fvae.query(
          "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
          localAccountForCertifications,
        ),
        fvae.mutation(
          "updateCertificationAuthorityLocalAccountCertificationsForUpdateLocalAccountCertificationsPage",
          updateCertificationsMutationResponse,
        ),
      ],
      { scope: "test" },
    ],
  });

  test("when i access the update local account certifications page - display the page with a correct title", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/settings/local-accounts/${LOCAL_ACCOUNT_ID}/certifications`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
      ),
    ]);

    await expect(
      page
        .getByTestId(
          "update-certification-authority-local-account-certifications-page",
        )
        .locator("h1", { hasText: "Certifications gérées" }),
    ).toBeVisible();
  });

  test("when i access the update local account certifications page - display the correct default selection state", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/settings/local-accounts/${LOCAL_ACCOUNT_ID}/certifications`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
      ),
    ]);

    const pageRoot = page.getByTestId(
      "update-certification-authority-local-account-certifications-page",
    );
    await expect(
      pageRoot
        .getByTestId(
          "multi-select-list-item-00fa1e5b-1535-4cb6-b542-0dad27dd6341",
        )
        .getByRole("button", { name: "Ajouter" }),
    ).toBeVisible();
    await expect(
      pageRoot
        .getByTestId(
          "multi-select-list-item-0236bf82-e85d-4e88-927a-c93bb6c44efb",
        )
        .getByRole("button", { name: "Retirer" }),
    ).toBeVisible();
  });

  test("when i access the update local account certifications page - display the certifications list with result count", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/settings/local-accounts/${LOCAL_ACCOUNT_ID}/certifications`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
      ),
    ]);

    await expect(
      page
        .getByTestId(
          "update-certification-authority-local-account-certifications-page",
        )
        .getByText("Résultat : 3 sur 3 élément(s)"),
    ).toBeVisible();
  });

  test("when i access the update local account certifications page - let me add a certification and see the mutation called", async ({
    page,
  }) => {
    await login({ role: "certificateur", page });
    await page.goto(
      `/admin2/certification-authorities/settings/local-accounts/${LOCAL_ACCOUNT_ID}/certifications`,
    );
    await Promise.all([
      certificateurSettingsCommonWait(page),
      waitGraphQL(
        page,
        "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
      ),
    ]);

    const pageRoot = page.getByTestId(
      "update-certification-authority-local-account-certifications-page",
    );
    const mutationPromise = waitGraphQL(
      page,
      "updateCertificationAuthorityLocalAccountCertificationsForUpdateLocalAccountCertificationsPage",
    );
    await pageRoot
      .getByTestId(
        "multi-select-list-item-00fa1e5b-1535-4cb6-b542-0dad27dd6341",
      )
      .getByRole("button", { name: "Ajouter" })
      .click();
    await mutationPromise;

    await expect(page).toHaveURL(
      new RegExp(
        `/certification-authorities/settings/local-accounts/${LOCAL_ACCOUNT_ID}/certifications`,
      ),
    );
  });
});
