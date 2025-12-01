import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  createCandidacyEntity,
  type CandidacyEntity,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationAuthorityEntity } from "@tests/helpers/entities/create-certification-authority.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import {
  createFeasibilityEntity,
  createFeasibilityUploadedPdfEntity,
  type FeasibilityEntity,
} from "@tests/helpers/entities/create-feasibility.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";
import {
  dossierDeFaisabiliteHandlers,
  navigateToDossierDeFaisabilite,
} from "@tests/helpers/handlers/dossier-de-faisabilite/dossier-de-faisabilite.handler";

import type { CandidacyStatusStep } from "@/graphql/generated/graphql";

import type {
  MswFixture,
  Page,
} from "next/experimental/testmode/playwright/msw";

const feasibilitySentTimestamp = 1728482555946;

const decisionFile = {
  name: "courrier_recevabilie.pdf",
  url: "https://example.com",
  previewUrl: "https://example.com",
  mimeType: "application/pdf",
};

const certificationAuthorities = [
  createCertificationAuthorityEntity({
    id: "cert1",
    label: "UIMM - Île-de-France",
    contactFullName: "John Certificator",
    contactEmail: "email@example.com",
  }),
  createCertificationAuthorityEntity({
    id: "cert2",
    label: "UIMM - Auvergne - Rhône-Alpes",
    contactFullName: "Jane Certificator",
    contactEmail: "email@example.com",
  }),
];

const baseFeasibilityUploadOptions = {
  feasibilityFileSentAt: feasibilitySentTimestamp,
  feasibilityFormat: "UPLOADED_PDF" as const,
  feasibilityUploadedPdf: createFeasibilityUploadedPdfEntity(),
};

const baseFeasibilityOptions = {
  ...baseFeasibilityUploadOptions,
  decisionSentAt: feasibilitySentTimestamp,
  decisionComment: "test comment",
  decisionFile,
  certificationAuthority: certificationAuthorities[0],
};

function createCandidacyFeasibilityWith(options: {
  status?: CandidacyStatusStep;
  feasibilityOptions?: Partial<FeasibilityEntity>;
}) {
  const certification = createCertificationEntity();
  const candidate = createCandidateEntity();
  const feasibility = options.feasibilityOptions
    ? createFeasibilityEntity(options.feasibilityOptions)
    : undefined;

  const candidacy = createCandidacyEntity({
    certification,
    candidate,
    typeAccompagnement: "AUTONOME",
    status: options.status || "PROJET",
    feasibility,
    feasibilityFormat: "UPLOADED_PDF",
    certificationAuthorities,
  });

  return { candidacy };
}

async function setupAndNavigateToFaisabilite(
  page: Page,
  msw: MswFixture,
  candidacy: CandidacyEntity,
) {
  const { handlers, dossierDeFaisabiliteWait } = dossierDeFaisabiliteHandlers({
    candidacy,
  });
  msw.use(...handlers);

  await login(page);
  await navigateToDossierDeFaisabilite(
    page,
    candidacy.candidate?.id,
    candidacy.id,
  );
  await dossierDeFaisabiliteWait(page);
}

test.describe("AUTONOME - Dossier de faisabilité", () => {
  test("should show an active and editable feasibility element in the dashboard when the type_accompagnement is autonome and the candidacy status is 'PROJET'", async ({
    page,
    msw,
  }) => {
    const { candidacy } = createCandidacyFeasibilityWith({
      status: "PROJET",
    });

    const { handlers, dashboardWait } = dashboardHandlers({ candidacy });
    msw.use(...handlers);

    await login(page);
    await dashboardWait(page);

    const feasibilityButton = page
      .locator('[data-testid="feasibility-tile"]')
      .getByRole("button");

    await expect(feasibilityButton).toBeVisible();
    await expect(feasibilityButton).toBeEnabled();
  });

  test("should show the upload form on /feasibility when the type_accompagnement is autonome and the candidacy status is 'PROJET'", async ({
    page,
    msw,
  }) => {
    const { candidacy } = createCandidacyFeasibilityWith({
      status: "PROJET",
    });

    await setupAndNavigateToFaisabilite(page, msw, candidacy);

    await expect(
      page.locator('[data-testid="feasibility-upload-form"]'),
    ).toBeVisible();
  });

  test("should show the upload form on /feasibility when the type_accompagnement is autonome and the decision is INCOMPLETE", async ({
    page,
    msw,
  }) => {
    const { candidacy } = createCandidacyFeasibilityWith({
      status: "DOSSIER_FAISABILITE_INCOMPLET",
      feasibilityOptions: {
        ...baseFeasibilityOptions,
        decision: "INCOMPLETE",
      },
    });

    await setupAndNavigateToFaisabilite(page, msw, candidacy);

    await expect(
      page.locator('[data-testid="feasibility-upload-form"]'),
    ).toBeVisible();
  });

  test("should show an info box with file sending date on /feasibility page when the type_accompagnement is autonome, decision is PENDING", async ({
    page,
    msw,
  }) => {
    const { candidacy } = createCandidacyFeasibilityWith({
      status: "DOSSIER_FAISABILITE_ENVOYE",
      feasibilityOptions: {
        ...baseFeasibilityUploadOptions,
        decision: "PENDING",
      },
    });

    await setupAndNavigateToFaisabilite(page, msw, candidacy);

    const decisionPending = page.locator(
      '[data-testid="feasibility-decision-pending"]',
    );
    await expect(decisionPending).toBeVisible();
    await expect(decisionPending.locator("h3")).toContainText(
      "Dossier envoyé le 09/10/2024",
    );
  });

  test("should not show upload form, but show uploaded files on /feasibility page when the type_accompagnement is autonome, decision is PENDING", async ({
    page,
    msw,
  }) => {
    const { candidacy } = createCandidacyFeasibilityWith({
      status: "DOSSIER_FAISABILITE_ENVOYE",
      feasibilityOptions: {
        ...baseFeasibilityUploadOptions,
        decision: "PENDING",
      },
    });

    await setupAndNavigateToFaisabilite(page, msw, candidacy);

    await expect(
      page.locator('[data-testid="feasibility-upload-form"]'),
    ).not.toBeVisible();
    await expect(
      page.locator(
        '[data-testid="feasibility-files-preview-dossier_de_faisabilite.pdf"]',
      ),
    ).toBeVisible();
    await expect(
      page
        .locator(
          '[data-testid="feasibility-files-preview-dossier_de_faisabilite.pdf"]',
        )
        .locator("label"),
    ).toContainText("dossier_de_faisabilite.pdf");
  });

  test("should show an info box with date of INCOMPLETE decision on /feasibility page when the type_accompagnement is autonome, decision is INCOMPLETE", async ({
    page,
    msw,
  }) => {
    const { candidacy } = createCandidacyFeasibilityWith({
      status: "DOSSIER_FAISABILITE_INCOMPLET",
      feasibilityOptions: {
        ...baseFeasibilityOptions,
        decision: "INCOMPLETE",
      },
    });

    await setupAndNavigateToFaisabilite(page, msw, candidacy);

    const decisionIncomplete = page.locator(
      '[data-testid="feasibility-decision-incomplete"]',
    );
    await expect(decisionIncomplete).toBeVisible();
    await expect(decisionIncomplete.locator("h3")).toContainText(
      "Dossier déclaré incomplet le 09/10/2024",
    );
    await expect(
      decisionIncomplete.getByText(
        'Voici le motif transmis par votre certificateur : "test comment"',
      ),
    ).toBeVisible();
  });

  test("should show an info box with date of ADMISSIBLE decision on /feasibility page when the type_accompagnement is autonome, decision is ADMISSIBLE", async ({
    page,
    msw,
  }) => {
    const { candidacy } = createCandidacyFeasibilityWith({
      status: "DOSSIER_FAISABILITE_RECEVABLE",
      feasibilityOptions: {
        ...baseFeasibilityOptions,
        decision: "ADMISSIBLE",
      },
    });

    await setupAndNavigateToFaisabilite(page, msw, candidacy);

    const decisionAdmissible = page.locator(
      '[data-testid="feasibility-decision-admissible"]',
    );
    await expect(decisionAdmissible).toBeVisible();
    await expect(decisionAdmissible.locator("h3")).toContainText(
      "Dossier déclaré recevable le 09/10/2024",
    );
    await expect(page.locator('[data-testid="decision-files"]')).toBeVisible();
  });

  test("should show an info box with date of REJECTED decision on /feasibility page when the type_accompagnement is autonome, decision is REJECTED", async ({
    page,
    msw,
  }) => {
    const { candidacy } = createCandidacyFeasibilityWith({
      status: "DOSSIER_FAISABILITE_NON_RECEVABLE",
      feasibilityOptions: {
        ...baseFeasibilityOptions,
        decision: "REJECTED",
      },
    });

    await setupAndNavigateToFaisabilite(page, msw, candidacy);

    const decisionRejected = page.locator(
      '[data-testid="feasibility-decision-rejected"]',
    );
    await expect(decisionRejected).toBeVisible();
    await expect(decisionRejected.locator("h3")).toContainText(
      "Dossier déclaré non recevable le 09/10/2024",
    );
    await expect(
      decisionRejected.getByText(
        'Voici le motif transmis par votre certificateur : "test comment"',
      ),
    ).toBeVisible();
  });
});
