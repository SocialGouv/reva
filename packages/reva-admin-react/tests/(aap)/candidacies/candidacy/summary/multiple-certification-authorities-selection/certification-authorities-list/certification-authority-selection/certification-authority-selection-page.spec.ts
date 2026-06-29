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
const CERTIFICATION_ID = "certification-1";
const DEPARTMENT_ID = "department-1";

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

const DEFAULT_CERTIFICATION_AUTHORITY = {
  id: CERTIFICATION_AUTHORITY_ID,
  label: "Autorité Certificatrice Test",
  contactFullName: "Marie Dupont",
  contactEmail: "cert@example.com",
  contactPhone: "0123456789",
  certificationAuthorityLocalAccounts: [],
};

type LocalAccount = {
  id: string;
  contactFullName: string;
  contactEmail: string | null;
  contactPhone: string | null;
};

const createHandlers = (
  certificationAuthority: {
    id: string;
    label: string;
    contactFullName: string;
    contactEmail: string | null;
    contactPhone: string | null;
    certificationAuthorityLocalAccounts?: LocalAccount[];
  } | null = DEFAULT_CERTIFICATION_AUTHORITY,
) => [
  fvae.query(
    "getCandidacyForCertificationAuthoritySelectionPage",
    graphQLResolver({
      getCandidacyById: {
        certification: {
          id: CERTIFICATION_ID,
        },
        candidate: {
          id: "candidate-1",
          department: {
            id: DEPARTMENT_ID,
          },
        },
      },
    }),
  ),
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
    waitGraphQL(page, "getCandidacyForCertificationAuthoritySelectionPage"),
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

    test("it should display the page title and description", async ({
      page,
    }) => {
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

    test("it should display the certification authority card with its contact information", async ({
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

    test("it should lead me back to the certification authorities list when I click on the 'Retour' button", async ({
      page,
    }) => {
      await goToCertificationAuthorityDetailsPage(page);

      await page.getByRole("link", { name: "Retour" }).click();

      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/summary/multiple-certification-authorities-selection/certification-authorities-list/`,
      );
    });
  });

  test.describe("with certification authority local accounts", () => {
    const localAccounts = [
      {
        id: "local-account-1",
        contactFullName: "Jean Martin",
        contactEmail: "jean.martin@example.com",
        contactPhone: "0102030405",
      },
    ] satisfies LocalAccount[];

    test.use({
      mswHandlers: [
        [
          ...createHandlers({
            ...DEFAULT_CERTIFICATION_AUTHORITY,
            certificationAuthorityLocalAccounts: localAccounts,
          }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("it should display a local account card for each local account with its contact information", async ({
      page,
    }) => {
      await goToCertificationAuthorityDetailsPage(page);

      const card = page.getByTestId(
        "certification-authority-local-account-card",
      );
      await expect(card).toBeVisible();
      await expect(card).toContainText(localAccounts[0].contactFullName);
      await expect(card).toContainText(localAccounts[0].contactEmail);
      await expect(card).toContainText(localAccounts[0].contactPhone);
      await expect(card).toContainText(DEFAULT_CERTIFICATION_AUTHORITY.label);
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

  test.describe("when I click on the 'Changer de certificateur' button", () => {
    test.use({
      mswHandlers: [
        [
          ...createHandlers(),
          ...aapCommonHandlers,
          fvae.mutation(
            "updateCertificationAuthorityForSelectionPage",
            graphQLResolver({
              candidacy_updateCertificationAuthority: {
                id: CANDIDACY_ID,
              },
            }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("it should update the certification authority and redirect me to the candidacy summary page", async ({
      page,
    }) => {
      await goToCertificationAuthorityDetailsPage(page);

      await page
        .getByRole("button", { name: "Changer de certificateur" })
        .click();

      await waitGraphQL(page, "updateCertificationAuthorityForSelectionPage");

      await expect(page.getByTestId("toast-success")).toBeVisible();
      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/summary/`,
      );
    });
  });
});
