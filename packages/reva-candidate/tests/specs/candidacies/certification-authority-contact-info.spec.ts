import { expect, test } from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import {
  createCandidacyEntity,
  CandidacyEntity,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import {
  createCandidaciesGuardsHandlers,
  createCandidacyGuardsAndDashboardHandlers,
  loginAndWaitForCandidaciesInitialLoad,
} from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";

import { Certification } from "@/graphql/generated/graphql";

const fvae = graphql.link("https://reva-api/api/graphql");

const candidate = createCandidateEntity();

const certification = createCertificationEntity({
  label: "Titre Professionnel Développeur Web",
  codeRncp: "RNCP1234",
}) as Certification;

function createCertificationAuthorityContactInfoHandlers(
  candidacy: CandidacyEntity,
  {
    activeFeaturesForConnectedUser = [],
    candidacyCertificationAuthority,
  }: {
    activeFeaturesForConnectedUser?: string[];
    candidacyCertificationAuthority?: {
      label: string;
      contactEmail: string;
      contactPhone: string;
    } | null;
  } = {},
) {
  return [
    ...createCandidaciesGuardsHandlers({
      candidate,
      candidacies: [candidacy],
      activeFeaturesForConnectedUser,
    }),
    ...createCandidacyGuardsAndDashboardHandlers(candidacy),
    fvae.query(
      "getCandidacyByIdForCertificationAuthorityContactInfoPage",
      graphQLResolver({
        getCandidacyById: {
          certification: {
            id: certification.id,
            codeRncp: certification.codeRncp,
            label: certification.label,
          },
          certificationAuthority: candidacyCertificationAuthority ?? null,
          certificationAuthorityLocalAccounts: [
            {
              contactFullName: "Jean Dupont",
              contactEmail: "jean.dupont@example.com",
              contactPhone: "0123456789",
            },
          ],
          feasibility: {
            certificationAuthority: {
              label: "Autorité Certificatrice",
              contactEmail: "contact@autorite.fr",
              contactPhone: "0987654321",
            },
          },
        },
      }),
    ),
  ];
}

test.describe("certification authority contact info page", () => {
  const candidacy = createCandidacyEntity({
    candidate,
    certification,
    status: "PARCOURS_CONFIRME",
  });

  test.use({
    mswHandlers: [
      createCertificationAuthorityContactInfoHandlers(candidacy),
      { scope: "test" },
    ],
  });

  test("shows the page title and description", async ({ page }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-contact-info/`,
    );

    await expect(
      page.getByRole("heading", { name: "Certificateur", level: 1 }),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Le certificateur étudiera les dossiers de faisabilité et de validation de cette candidature.",
      ),
    ).toBeVisible();
  });

  test("shows the breadcrumb with certification details", async ({ page }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-contact-info/`,
    );

    const breadcrumb = page.getByLabel("vous êtes ici :");

    await expect(
      breadcrumb.getByRole("link", { name: "Mes candidatures" }),
    ).toBeVisible();

    await expect(
      breadcrumb.getByRole("link", {
        name: `RNCP ${certification.codeRncp} : ${certification.label}`,
      }),
    ).toBeVisible();

    await expect(breadcrumb.getByText("Certificateur")).toBeVisible();
  });

  test("shows a back button", async ({ page }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-contact-info/`,
    );

    await expect(page.getByRole("button", { name: "Retour" })).toBeVisible();
  });

  test("shows the certification authority card", async ({ page }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-contact-info/`,
    );

    const card = page.getByTestId("certification-authority-card");

    await expect(card).toBeVisible();
    await expect(card.getByText("Gestionnaire de candidatures")).toBeVisible();
    await expect(
      card.getByRole("heading", { name: "Autorité Certificatrice" }),
    ).toBeVisible();
    await expect(card.getByText("contact@autorite.fr")).toBeVisible();
    await expect(card.getByText("0987654321")).toBeVisible();
  });

  test("shows the certification authority local account card", async ({
    page,
  }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-contact-info/`,
    );

    const card = page.getByTestId("certification-authority-local-account-card");

    await expect(card).toBeVisible();
    await expect(card.getByText("Compte local")).toBeVisible();
    await expect(card.getByText("Autorité Certificatrice")).toBeVisible();
    await expect(
      card.getByRole("heading", { name: "Jean Dupont" }),
    ).toBeVisible();
    await expect(card.getByText("jean.dupont@example.com")).toBeVisible();
    await expect(card.getByText("0123456789")).toBeVisible();
  });
});

test.describe("certification authority contact info page with NEW_CANDIDACY_CERTIFICATION_AUTHORITY_CARD feature active", () => {
  const candidacy = createCandidacyEntity({
    candidate,
    certification,
    status: "PARCOURS_CONFIRME",
  });

  test.use({
    mswHandlers: [
      createCertificationAuthorityContactInfoHandlers(candidacy, {
        activeFeaturesForConnectedUser: [
          "NEW_CANDIDACY_CERTIFICATION_AUTHORITY_CARD",
        ],
        candidacyCertificationAuthority: {
          label: "Candidacy Certification Authority",
          contactEmail: "candidacy-authority@example.com",
          contactPhone: "0611223344",
        },
      }),
      { scope: "test" },
    ],
  });

  test("shows the certification authority card from candidacy.certificationAuthority instead of feasibility.certificationAuthority", async ({
    page,
  }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-contact-info/`,
    );

    const card = page.getByTestId("certification-authority-card");

    await expect(card).toBeVisible();
    await expect(
      card.getByRole("heading", {
        name: "Candidacy Certification Authority",
      }),
    ).toBeVisible();
    await expect(
      card.getByText("candidacy-authority@example.com"),
    ).toBeVisible();
    await expect(card.getByText("0611223344")).toBeVisible();

    await expect(card.getByText("Autorité Certificatrice")).toHaveCount(0);
  });
});

test.describe("certification authority contact info page with NEW_CANDIDACY_CERTIFICATION_AUTHORITY_CARD feature active and no candidacy.certificationAuthority", () => {
  const candidacy = createCandidacyEntity({
    candidate,
    certification,
    status: "PARCOURS_CONFIRME",
  });

  test.use({
    mswHandlers: [
      createCertificationAuthorityContactInfoHandlers(candidacy, {
        activeFeaturesForConnectedUser: [
          "NEW_CANDIDACY_CERTIFICATION_AUTHORITY_CARD",
        ],
        candidacyCertificationAuthority: null,
      }),
      { scope: "test" },
    ],
  });

  test("renders nothing, even though feasibility.certificationAuthority is set", async ({
    page,
  }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-contact-info/`,
    );

    await expect(
      page.getByRole("heading", { name: "Certificateur", level: 1 }),
    ).toHaveCount(0);
    await expect(page.getByTestId("certification-authority-card")).toHaveCount(
      0,
    );
  });
});
