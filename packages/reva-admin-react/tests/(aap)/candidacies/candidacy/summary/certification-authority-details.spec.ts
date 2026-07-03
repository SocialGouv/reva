import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

import type { Page } from "next/experimental/testmode/playwright/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers({
  activeFeaturesForConnectedUser: [],
});

const DEFAULT_CERTIFICATION_AUTHORITY = {
  id: "cert-auth-1",
  label: "Autorité Certificatrice Test",
  contactFullName: "Marie Dupont",
  contactEmail: "cert@example.com",
  contactPhone: "0123456789",
};

function createHandlers({
  certificationAuthority = DEFAULT_CERTIFICATION_AUTHORITY,
  certificationAuthorityLocalAccounts = [],
  isCandidacyCertificationAuthorityUpdatable = false,
}: {
  certificationAuthority?: {
    id: string;
    label: string;
    contactFullName: string;
    contactEmail: string | null;
    contactPhone: string | null;
  } | null;
  certificationAuthorityLocalAccounts?: {
    contactFullName: string;
    contactEmail: string | null;
    contactPhone: string | null;
  }[];
  isCandidacyCertificationAuthorityUpdatable?: boolean;
} = {}) {
  return [
    fvae.query(
      "getCertificationAuthorityDetails",
      graphQLResolver({
        getCandidacyById: {
          certificationAuthority,
          certificationAuthorityLocalAccounts,
          isCandidacyCertificationAuthorityUpdatable,
        },
      }),
    ),
  ];
}

async function visitPage(page: Page) {
  await login({ role: "aap", page });
  await page.goto(
    `/admin2/candidacies/${CANDIDACY_ID}/summary/certification-authority-details/`,
  );
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(page, "getCertificationAuthorityDetails"),
  ]);
}

test.describe("Certification authority details page", () => {
  test.describe("with a full certification authority and no local accounts", () => {
    test.use({
      mswHandlers: [
        [...createHandlers(), ...aapCommonHandlers],
        { scope: "test" },
      ],
    });

    test("should display the page heading", async ({ page }) => {
      await visitPage(page);
      await expect(
        page.getByRole("heading", { name: "Certificateur", level: 1 }),
      ).toBeVisible();
    });

    test("should display the introductory paragraph", async ({ page }) => {
      await visitPage(page);
      await expect(
        page.getByText(
          "Le certificateur étudiera les dossiers de faisabilité et de validation de cette candidature.",
        ),
      ).toBeVisible();
    });

    test("should display the certification authority card", async ({
      page,
    }) => {
      await visitPage(page);
      await expect(
        page.getByTestId("certification-authority-card"),
      ).toBeVisible();
    });

    test("should display the authority label in the card", async ({ page }) => {
      await visitPage(page);
      await expect(
        page.getByTestId("certification-authority-card"),
      ).toContainText(DEFAULT_CERTIFICATION_AUTHORITY.label);
    });

    test("should display the authority contact email in the card", async ({
      page,
    }) => {
      await visitPage(page);
      await expect(
        page.getByTestId("certification-authority-card"),
      ).toContainText(DEFAULT_CERTIFICATION_AUTHORITY.contactEmail);
    });

    test("should display the authority contact phone in the card", async ({
      page,
    }) => {
      await visitPage(page);
      await expect(
        page.getByTestId("certification-authority-card"),
      ).toContainText(DEFAULT_CERTIFICATION_AUTHORITY.contactPhone);
    });

    test("should not display any local account cards", async ({ page }) => {
      await visitPage(page);
      await expect(
        page.getByTestId("certification-authority-local-account-card"),
      ).toHaveCount(0);
    });
  });

  test.describe("with a certification authority and multiple local accounts", () => {
    const LOCAL_ACCOUNTS = [
      {
        contactFullName: "Jean Martin",
        contactEmail: "jean.martin@example.com",
        contactPhone: "0611223344",
      },
      {
        contactFullName: "Sophie Bernard",
        contactEmail: "sophie.bernard@example.com",
        contactPhone: null,
      },
    ];

    test.use({
      mswHandlers: [
        [
          ...createHandlers({
            certificationAuthorityLocalAccounts: LOCAL_ACCOUNTS,
          }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should display two local account cards", async ({ page }) => {
      await visitPage(page);
      await expect(
        page.getByTestId("certification-authority-local-account-card"),
      ).toHaveCount(2);
    });

    test("should display the first local account's full name", async ({
      page,
    }) => {
      await visitPage(page);
      await expect(
        page.getByTestId("certification-authority-local-account-card").nth(0),
      ).toContainText(LOCAL_ACCOUNTS[0].contactFullName);
    });

    test("should display the parent authority label on the first card", async ({
      page,
    }) => {
      await visitPage(page);
      await expect(
        page.getByTestId("certification-authority-local-account-card").nth(0),
      ).toContainText(DEFAULT_CERTIFICATION_AUTHORITY.label);
    });

    test("should display email and phone for the first local account", async ({
      page,
    }) => {
      await visitPage(page);
      const firstCard = page
        .getByTestId("certification-authority-local-account-card")
        .nth(0);
      await expect(firstCard).toContainText(LOCAL_ACCOUNTS[0].contactEmail);
      await expect(firstCard).toContainText(LOCAL_ACCOUNTS[0].contactPhone!);
    });

    test("should display the second local account's full name", async ({
      page,
    }) => {
      await visitPage(page);
      await expect(
        page.getByTestId("certification-authority-local-account-card").nth(1),
      ).toContainText(LOCAL_ACCOUNTS[1].contactFullName);
    });

    test("should display email but no phone for the second local account", async ({
      page,
    }) => {
      await visitPage(page);
      const secondCard = page
        .getByTestId("certification-authority-local-account-card")
        .nth(1);
      await expect(secondCard).toContainText(LOCAL_ACCOUNTS[1].contactEmail);
      await expect(secondCard).not.toContainText(
        LOCAL_ACCOUNTS[0].contactPhone!,
      );
    });
  });

  test.describe("without a certification authority", () => {
    test.use({
      mswHandlers: [
        [
          ...createHandlers({ certificationAuthority: null }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should not display the certification authority card", async ({
      page,
    }) => {
      await visitPage(page);
      await expect(
        page.getByTestId("certification-authority-card"),
      ).not.toBeVisible();
    });

    test("should not display any local account cards", async ({ page }) => {
      await visitPage(page);
      await expect(
        page.getByTestId("certification-authority-local-account-card"),
      ).toHaveCount(0);
    });
  });

  test.describe("navigation", () => {
    test.use({
      mswHandlers: [
        [...createHandlers(), ...aapCommonHandlers],
        { scope: "test" },
      ],
    });

    test("clicking 'Retour' navigates back to the summary page", async ({
      page,
    }) => {
      await visitPage(page);
      await page.getByRole("link", { name: "Retour" }).click();
      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/summary/`,
      );
    });
  });

  test.describe("when certification authority is updatable", () => {
    test.use({
      mswHandlers: [
        [
          ...createHandlers({
            isCandidacyCertificationAuthorityUpdatable: true,
          }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should display the 'Changer de certificateur' button", async ({
      page,
    }) => {
      await visitPage(page);
      await expect(
        page.getByRole("link", { name: "Changer de certificateur" }),
      ).toBeVisible();
    });

    test("'Changer de certificateur' links to the certification authorities list page", async ({
      page,
    }) => {
      await visitPage(page);
      await expect(
        page.getByRole("link", { name: "Changer de certificateur" }),
      ).toHaveAttribute(
        "href",
        `/admin2/candidacies/${CANDIDACY_ID}/summary/multiple-certification-authorities-selection/certification-authorities-list/`,
      );
    });
  });

  test.describe("when certification authority is not updatable", () => {
    test.use({
      mswHandlers: [
        [
          ...createHandlers({
            isCandidacyCertificationAuthorityUpdatable: false,
          }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should not display the 'Changer de certificateur' button", async ({
      page,
    }) => {
      await visitPage(page);
      await expect(
        page.getByRole("link", { name: "Changer de certificateur" }),
      ).not.toBeVisible();
    });
  });
});
