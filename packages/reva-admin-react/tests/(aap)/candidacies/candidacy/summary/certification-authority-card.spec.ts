import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";
const CERTIFICATION_AUTHORITY_LABEL = "Autorité Certificatrice Test";

function createSummaryHandlers({
  certificationAuthority = {
    id: "cert-auth-1",
    label: CERTIFICATION_AUTHORITY_LABEL,
  },
  certificationAuthorities = [],
  isCandidacyCertificationAuthorityUpdatable = false,
}: {
  certificationAuthority?: { id: string; label: string } | null;
  certificationAuthorities?: { id: string }[];
  isCandidacyCertificationAuthorityUpdatable?: boolean;
} = {}) {
  return [
    fvae.query(
      "getCandidacySummaryById",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          financeModule: "unifvae",
          typeAccompagnement: "ACCOMPAGNE",
          endAccompagnementStatus: null,
          endAccompagnementDate: null,
          certificationAuthorities,
          certificationAuthorityLocalAccounts: [],
          candidacyDropOut: null,
          reorientationReason: null,
          organism: {
            label: "Organism Label",
            contactAdministrativeEmail: "contact@example.com",
            emailContact: "contact@example.com",
            nomPublic: "Organism Label",
            maisonMereAAP: { id: "mm-1" },
          },
          status: "PRISE_EN_CHARGE",
          certification: {
            id: "cert-1",
            codeRncp: "RNCP1234",
            label: "Certification Label",
          },
          candidateInfo: null,
          candidate: {
            id: "candidate-1",
            firstname: "John",
            lastname: "Doe",
            street: "1 rue de la Paix",
            city: "Paris",
            zip: "75001",
            department: { id: "dep-75", label: "Île-de-France", code: "75" },
            contactInformationCompleted: true,
          },
          experiences: [],
          goals: [],
          feasibilityFormat: "DEMATERIALIZED",
          feasibility: null,
          certificationAuthority,
          isCandidacyCertificationAuthorityUpdatable,
        },
      }),
    ),
  ];
}

test.describe("Certification authority card V2 (feature flag active)", () => {
  const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers({
    activeFeaturesForConnectedUser: [
      "NEW_CANDIDACY_CERTIFICATION_AUTHORITY_CARD",
    ],
  });

  test.describe("with a certification authority", () => {
    test.use({
      mswHandlers: [
        [...createSummaryHandlers(), ...aapCommonHandlers],
        { scope: "test" },
      ],
    });

    test("should display the certification authority label", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      await expect(
        page.getByTestId("certification-authority-summary-card"),
      ).toBeVisible();
      await expect(page.getByText(CERTIFICATION_AUTHORITY_LABEL)).toBeVisible();
    });

    test("should display a 'Consulter' button", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      const consulterLink = page
        .getByTestId("certification-authority-summary-card")
        .getByRole("button", { name: "Consulter" });
      await expect(consulterLink).toBeVisible();
    });

    test("should lead me to the certification authority details page when i click on the 'Consulter' button", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      const consulterLink = page
        .getByTestId("certification-authority-summary-card")
        .getByRole("button", { name: "Consulter" });
      await consulterLink.click();
      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/summary/certification-authority-details/`,
      );
    });
  });

  test.describe("with a certification authority, updatable, and multiple authorities available", () => {
    test.use({
      mswHandlers: [
        [
          ...createSummaryHandlers({
            isCandidacyCertificationAuthorityUpdatable: true,
            certificationAuthorities: [
              { id: "cert-auth-1" },
              { id: "cert-auth-2" },
            ],
          }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should display a 'Modifier' button instead of 'Consulter'", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      const card = page.getByTestId("certification-authority-summary-card");
      await expect(card.getByRole("button", { name: "Modifier" })).toBeVisible();
      await expect(card.getByRole("button", { name: "Consulter" })).not.toBeVisible();
    });

    test("should lead to the certification authority details page when clicking 'Modifier'", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      const modifierButton = page
        .getByTestId("certification-authority-summary-card")
        .getByRole("button", { name: "Modifier" });
      await modifierButton.click();
      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/summary/certification-authority-details/`,
      );
    });
  });

  test.describe("with a certification authority, updatable, but only one authority available", () => {
    test.use({
      mswHandlers: [
        [
          ...createSummaryHandlers({
            isCandidacyCertificationAuthorityUpdatable: true,
            certificationAuthorities: [{ id: "cert-auth-1" }],
          }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should still display 'Consulter' when only one authority is available", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      const card = page.getByTestId("certification-authority-summary-card");
      await expect(card.getByRole("button", { name: "Consulter" })).toBeVisible();
      await expect(card.getByRole("button", { name: "Modifier" })).not.toBeVisible();
    });
  });

  test.describe("without a certification authority", () => {
    test.use({
      mswHandlers: [
        [
          ...createSummaryHandlers({ certificationAuthority: null }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should display the empty certification authority card", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      const card = page.getByTestId(
        "empty-certification-authority-summary-card",
      );
      await expect(card).toBeVisible();
    });
  });

  test.describe("with multiple certification authorities", () => {
    test.use({
      mswHandlers: [
        [
          ...createSummaryHandlers({
            certificationAuthority: null,
            certificationAuthorities: [
              { id: "cert-auth-1" },
              { id: "cert-auth-2" },
            ],
          }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should display the multiple certification authorities card", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      await expect(
        page.getByTestId("multiple-certification-authorities-summary-card"),
      ).toBeVisible();
    });

    test("should lead me to the select certification authority page when i click on the 'Modifier' button", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      const modifierButton = page
        .getByTestId("multiple-certification-authorities-summary-card")
        .getByRole("button", { name: "Compléter" });
      await modifierButton.click();
      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/summary/multiple-certification-authorities-selection/disclaimer/`,
      );
    });
  });
});

test.describe("Certification authority card V1 (feature flag inactive)", () => {
  const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers({
    activeFeaturesForConnectedUser: [],
  });

  test.use({
    mswHandlers: [
      [...createSummaryHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test("should not display the 'Consulter' button", async ({ page }) => {
    await login({ role: "aap", page });
    await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
    await Promise.all([
      aapCommonWait(page),
      waitGraphQL(page, "getCandidacySummaryById"),
    ]);

    await expect(
      page.getByRole("link", { name: "Consulter" }),
    ).not.toBeVisible();
  });
});
