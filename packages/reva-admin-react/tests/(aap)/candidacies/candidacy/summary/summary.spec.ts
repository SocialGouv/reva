import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import type { Page } from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "46206f6b-0a59-4478-9338-45e3a8d968e4";

function createHandlers({
  financeModule = "unifvae",
  feasibilityFormat = "DEMATERIALIZED" as "DEMATERIALIZED" | "UPLOADED_PDF",
  status = "PRISE_EN_CHARGE",
  modaliteAccompagnement = "A_DISTANCE",
}: {
  financeModule?: string;
  feasibilityFormat?: "DEMATERIALIZED" | "UPLOADED_PDF";
  status?: string;
  modaliteAccompagnement?: string;
} = {}) {
  return [
    fvae.query(
      "getCandidacySummaryById",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          financeModule,
          typeAccompagnement: "ACCOMPAGNE",
          endAccompagnementStatus: null,
          endAccompagnementDate: null,
          certificationAuthorityLocalAccounts: [
            {
              contactFullName: "Jane Doe public contact",
              contactEmail: "janedoepublic@uncertificateur.fr",
              contactPhone: "0123456789",
            },
            {
              contactFullName: "John Doe public contact",
              contactEmail: "johndoepublic@uncertificateur.fr",
              contactPhone: "023456789",
            },
          ],
          candidacyDropOut: null,
          reorientationReason: null,
          organism: {
            label: "Organism Label",
            contactAdministrativeEmail: "contact@example.com",
            emailContact: "contact@example.com",
            nomPublic: "Organism Label",
            maisonMereAAP: { id: "mm-1" },
          },
          status,
          certification: {
            id: "cert-1",
            codeRncp: "RNCP1234",
            label: "Certification Label",
          },
          candidateInfo: null,
          candidate: {
            id: "candidate-1",
            firstname: "Alice",
            firstname2: null,
            firstname3: null,
            middleNames: null,
            givenName: null,
            gender: null,
            lastname: "Doe",
            phone: "06000000",
            email: "alice.doe@example.com",
            street: "1 rue de la Paix",
            city: "Paris",
            zip: "75001",
            birthdate: null,
            birthCity: null,
            birthDepartment: null,
            country: null,
            nationality: null,
            department: { id: "dep-75", label: "Île-de-France", code: "75" },
            highestDegree: null,
            highestDegreeLabel: null,
            niveauDeFormationLePlusEleve: null,
            civilInformationCompleted: false,
            contactInformationCompleted: true,
          },
          experiences: [],
          goals: [],
          feasibilityFormat,
          feasibility: null,
          certificationAuthority: {
            id: "cert-auth-1",
            label: "Un certificateur",
          },
        },
      }),
    ),
    fvae.query(
      "getCandidacyMenuAndCandidateInfos",
      graphQLResolver({
        candidacyMenu_getCandidacyMenu: {
          menuHeader: [],
          mainMenu: [],
          menuFooter: [],
        },
        getCandidacyById: {
          financeModule,
          organism: { modaliteAccompagnement },
          candidate: {
            lastname: "Doe",
            firstname: "Alice",
            givenName: null,
          },
        },
      }),
    ),
  ];
}

async function visitSummary({
  page,
  role = "aap",
}: {
  page: Page;
  role?: "aap" | "admin";
}) {
  await login({ role, page });
  await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
}

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

for (const feasibilityFormat of [
  "DEMATERIALIZED",
  "UPLOADED_PDF",
] as const) {
  test.describe(`Candidacy with ${feasibilityFormat} feasibility format`, () => {
    test.describe("with hors_plateforme finance module", () => {
      test.use({
        mswHandlers: [
          [
            ...createHandlers({
              feasibilityFormat,
              financeModule: "hors_plateforme",
            }),
            ...aapCommonHandlers,
          ],
          { scope: "test" },
        ],
      });

      test("should display alert block when funding not available", async ({
        page,
      }) => {
        await visitSummary({ page });
        await Promise.all([
          aapCommonWait(page),
          waitGraphQL(page, "getCandidacySummaryById"),
        ]);

        await expect(
          page.getByTestId("funding-request-not-available-alert"),
        ).toBeVisible();
      });

      test("should display a specific tag when funding not available", async ({
        page,
      }) => {
        await visitSummary({ page });
        await Promise.all([
          aapCommonWait(page),
          waitGraphQL(page, "getCandidacySummaryById"),
        ]);

        await expect(page.getByTestId("tag-not-fundable")).toBeVisible();
      });

      test("should display a specific tag when accompagnement is remote", async ({
        page,
      }) => {
        await visitSummary({ page });
        await Promise.all([
          aapCommonWait(page),
          waitGraphQL(page, "getCandidacySummaryById"),
        ]);

        await expect(page.getByTestId("tag-remote")).toBeVisible();
      });
    });

    test.describe("with LIEU_ACCUEIL accompagnement", () => {
      test.use({
        mswHandlers: [
          [
            ...createHandlers({
              feasibilityFormat,
              financeModule: "hors_plateforme",
              modaliteAccompagnement: "LIEU_ACCUEIL",
            }),
            ...aapCommonHandlers,
          ],
          { scope: "test" },
        ],
      });

      test("should display a specific tag when accompagnement is on site", async ({
        page,
      }) => {
        await visitSummary({ page });
        await Promise.all([
          aapCommonWait(page),
          waitGraphQL(page, "getCandidacySummaryById"),
        ]);

        await expect(page.getByTestId("tag-on-site")).toBeVisible();
      });
    });
  });
}

test.describe("Candidacy summary page", () => {
  test.use({
    mswHandlers: [
      [...createHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test("should not display alert block when funding is available", async ({
    page,
  }) => {
    await visitSummary({ page });
    await Promise.all([
      aapCommonWait(page),
      waitGraphQL(page, "getCandidacySummaryById"),
    ]);

    await expect(page.getByTestId("candidate-information")).toBeVisible();
    await expect(
      page.getByTestId("funding-request-not-available-alert"),
    ).not.toBeVisible();
  });

  test("should display editable candidate information and profile when feasibility is dematerialized", async ({
    page,
  }) => {
    await visitSummary({ page });
    await Promise.all([
      aapCommonWait(page),
      waitGraphQL(page, "getCandidacySummaryById"),
    ]);

    await expect(
      page.getByTestId("candidate-information").getByRole("button"),
    ).toBeVisible();
    await expect(
      page.getByTestId("candidate-profile").getByRole("button"),
    ).toBeVisible();
  });

  test("should display 'to complete' badges on new dematerialized candidacy", async ({
    page,
  }) => {
    await visitSummary({ page });
    await Promise.all([
      aapCommonWait(page),
      waitGraphQL(page, "getCandidacySummaryById"),
    ]);

    await expect(
      page.getByTestId("candidate-information").getByTestId("to-complete-badge"),
    ).toBeVisible();
    await expect(
      page.getByTestId("candidate-profile").getByTestId("to-complete-badge"),
    ).toBeVisible();
  });

  test("should display the candidate contact details", async ({ page }) => {
    await visitSummary({ page });
    await Promise.all([
      aapCommonWait(page),
      waitGraphQL(page, "getCandidacySummaryById"),
    ]);

    await expect(page.getByTestId("candidate-contact-details")).toBeVisible();
    await expect(
      page.getByTestId("candidate-contact-details-phone"),
    ).toContainText("06000000");
    await expect(
      page.getByTestId("candidate-contact-details-email"),
    ).toContainText("alice.doe@example.com");
  });

  test("should lead to the update candidate contact details page when the action button is clicked", async ({
    page,
  }) => {
    await visitSummary({ page });
    await Promise.all([
      aapCommonWait(page),
      waitGraphQL(page, "getCandidacySummaryById"),
    ]);

    await page
      .getByTestId("candidate-contact-details")
      .getByTestId("action-button")
      .click();
    await expect(page).toHaveURL(
      `/admin2/candidacies/${CANDIDACY_ID}/summary/candidate-contact-details/`,
    );
  });

  test("should display certification authority's contact information", async ({
    page,
  }) => {
    await visitSummary({ page });
    await Promise.all([
      aapCommonWait(page),
      waitGraphQL(page, "getCandidacySummaryById"),
    ]);

    const account0 = page.getByTestId("certification-authority-local-account-0");
    const account1 = page.getByTestId("certification-authority-local-account-1");

    await expect(account0).toBeVisible();
    await expect(account1).toBeVisible();
    await expect(account0).toContainText("Jane Doe public contact");
    await expect(account0).toContainText("janedoepublic@uncertificateur.fr");
    await expect(account0).toContainText("0123456789");
    await expect(account1).toContainText("John Doe public contact");
    await expect(account1).toContainText("johndoepublic@uncertificateur.fr");
    await expect(account1).toContainText("023456789");
  });
});

test.describe("AAP actions", () => {
  test.describe("when candidacy can be archived", () => {
    test.use({
      mswHandlers: [
        [
          ...createHandlers({ status: "PRISE_EN_CHARGE" }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should display the archive candidacy button", async ({ page }) => {
      await visitSummary({ page });
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      await expect(page.getByTestId("archive-candidacy-button")).toBeVisible();
    });

    test("should lead to the archive candidacy page when the archive button is clicked", async ({
      page,
    }) => {
      await visitSummary({ page });
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      await page.getByTestId("archive-candidacy-button").click();
      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/archive/`,
      );
    });
  });

  test.describe("when candidacy status is DOSSIER_FAISABILITE_RECEVABLE", () => {
    test.use({
      mswHandlers: [
        [
          ...createHandlers({ status: "DOSSIER_FAISABILITE_RECEVABLE" }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should not display the archive candidacy button", async ({ page }) => {
      await visitSummary({ page });
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      await expect(page.getByTestId("candidate-information")).toBeVisible();
      await expect(
        page.getByTestId("archive-candidacy-button"),
      ).not.toBeVisible();
    });
  });

  test.describe("when candidacy is already archived", () => {
    test.use({
      mswHandlers: [
        [
          ...createHandlers({ status: "ARCHIVE" }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should not display the archive candidacy button", async ({ page }) => {
      await visitSummary({ page });
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacySummaryById"),
      ]);

      await expect(page.getByTestId("candidate-information")).toBeVisible();
      await expect(
        page.getByTestId("archive-candidacy-button"),
      ).not.toBeVisible();
    });
  });
});
