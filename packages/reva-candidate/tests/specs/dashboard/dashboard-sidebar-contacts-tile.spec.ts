import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  createCandidacyEntity,
  createCandidacyStatuses,
  type CreateCandidacyEntityOptions,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationAuthorityEntity } from "@tests/helpers/entities/create-certification-authority.entity";
import { createFeasibilityEntity } from "@tests/helpers/entities/create-feasibility.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import type { MswFixture } from "next/experimental/testmode/playwright/msw";
import type { Page } from "playwright";

function createDashboardCandidacy(
  overrides: CreateCandidacyEntityOptions = {},
): CandidacyEntity {
  return createCandidacyEntity({
    candidate: createCandidateEntity(),
    typeAccompagnement: "ACCOMPAGNE",
    feasibilityFormat: "UPLOADED_PDF",
    candidacyStatuses: createCandidacyStatuses(["PROJET"]),
    feasibility: createFeasibilityEntity({
      certificationAuthority: null,
    }),
    certificationAuthorityLocalAccounts: null,
    ...overrides,
  });
}

async function setupDashboard(
  page: Page,
  msw: MswFixture,
  candidacy: CandidacyEntity,
) {
  const { handlers, dashboardWait } = dashboardHandlers({
    candidacy,
    activeFeaturesForConnectedUser: [],
  });

  msw.use(...handlers);
  await login(page);
  await dashboardWait(page);
}

test.describe("NoContactTile", () => {
  test("should display when no contacts exist", async ({ page, msw }) => {
    const candidacy = createDashboardCandidacy();

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("no-contact-tile")).toBeVisible();
    await expect(page.getByTestId("aap-contact-tile")).toHaveCount(0);
    await expect(
      page.getByTestId("certification-authority-contact-tile"),
    ).toHaveCount(0);
  });
});

test.describe("AapContactTile", () => {
  test("should display when organism data is available", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      organism: createOrganismEntity({
        emailContact: "contact@organism.test",
        telephone: "0123456789",
        nomPublic: null,
        adresseNumeroEtNomDeRue: null,
        adresseInformationsComplementaires: null,
        adresseCodePostal: null,
        adresseVille: null,
      }),
    });

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("aap-contact-tile")).toBeVisible();
    await expect(page.getByTestId("no-contact-tile")).toHaveCount(0);
  });

  test("should display with complete address information when available", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      organism: createOrganismEntity({
        emailContact: "contact@organism.test",
        telephone: "0123456789",
        nomPublic: null,
        adresseNumeroEtNomDeRue: "123 Rue de Test",
        adresseInformationsComplementaires: "Bâtiment A",
        adresseCodePostal: "75001",
        adresseVille: "Paris",
      }),
    });

    await setupDashboard(page, msw, candidacy);

    const aapContactTile = page.getByTestId("aap-contact-tile");

    await expect(aapContactTile).toBeVisible();
    await expect(aapContactTile).toContainText("123 Rue de Test");
    await expect(aapContactTile).toContainText("Bâtiment A");
    await expect(aapContactTile).toContainText("75001 Paris");
  });

  test("should use nomPublic instead of label when available", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      organism: createOrganismEntity({
        nomPublic: "Public Organism Name",
        emailContact: "contact@organism.test",
        telephone: "0123456789",
        adresseNumeroEtNomDeRue: null,
        adresseInformationsComplementaires: null,
        adresseCodePostal: null,
        adresseVille: null,
      }),
    });

    await setupDashboard(page, msw, candidacy);

    const aapContactTile = page.getByTestId("aap-contact-tile");

    await expect(aapContactTile).toBeVisible();
    await expect(aapContactTile).toContainText("Public Organism Name");
  });

  test("should use administrative contact details as fallback", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      organism: createOrganismEntity({
        emailContact: null,
        telephone: null,
        nomPublic: null,
        adresseNumeroEtNomDeRue: null,
        adresseInformationsComplementaires: null,
        adresseCodePostal: null,
        adresseVille: null,
        contactAdministrativeEmail: "admin@organism.test",
        contactAdministrativePhone: "9876543210",
      }),
    });

    await setupDashboard(page, msw, candidacy);

    const aapContactTile = page.getByTestId("aap-contact-tile");

    await expect(aapContactTile).toBeVisible();
    await expect(aapContactTile).toContainText("admin@organism.test");
    await expect(aapContactTile).toContainText("9876543210");
  });
});

test.describe("CertificationAuthorityContactTile", () => {
  test("should display when certification authority data is available", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      feasibility: createFeasibilityEntity({
        certificationAuthority: createCertificationAuthorityEntity({
          label: "Test Certification Authority",
          contactFullName: "John Doe",
          contactEmail: "john.doe@authority.test",
        }),
      }),
    });

    await setupDashboard(page, msw, candidacy);

    await expect(
      page.getByTestId("certification-authority-contact-tile"),
    ).toBeVisible();
    await expect(page.getByTestId("no-contact-tile")).toHaveCount(0);
  });

  test("should handle missing contact information", async ({ page, msw }) => {
    const candidacy = createDashboardCandidacy({
      feasibility: createFeasibilityEntity({
        certificationAuthority: createCertificationAuthorityEntity({
          label: "Test Certification Authority",
          contactFullName: null,
          contactEmail: null,
          contactPhone: null,
        }),
      }),
    });

    await setupDashboard(page, msw, candidacy);

    const certificationAuthorityContactTile = page.getByTestId(
      "certification-authority-contact-tile",
    );

    await expect(certificationAuthorityContactTile).toBeVisible();
    await expect(certificationAuthorityContactTile).toContainText(
      "Test Certification Authority",
    );
  });

  test("should lead me to the certification authority contact info page when i click on the tile", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      feasibility: createFeasibilityEntity({
        certificationAuthority: createCertificationAuthorityEntity({
          label: "Test Certification Authority",
        }),
      }),
    });

    await setupDashboard(page, msw, candidacy);

    await page.getByTestId("certification-authority-contact-tile").click();

    await expect(page).toHaveURL(
      "/candidat/candidates/1/candidacies/1/certification-authority-contact-info/",
    );
  });
});

test.describe("Multiple Contact Tiles", () => {
  test("should display both AAP and certification authority tiles when both exist", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      organism: createOrganismEntity({
        emailContact: "contact@organism.test",
        telephone: "0123456789",
        nomPublic: null,
        adresseNumeroEtNomDeRue: null,
        adresseInformationsComplementaires: null,
        adresseCodePostal: null,
        adresseVille: null,
      }),
      feasibility: createFeasibilityEntity({
        certificationAuthority: createCertificationAuthorityEntity({
          label: "Test Certification Authority",
          contactFullName: "John Doe",
          contactEmail: "john.doe@authority.test",
        }),
      }),
    });

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("aap-contact-tile")).toBeVisible();
    await expect(
      page.getByTestId("certification-authority-contact-tile"),
    ).toBeVisible();
    await expect(page.getByTestId("no-contact-tile")).toHaveCount(0);
  });
});
