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

import type {
  CandidacyStatusStep,
  Certification,
} from "@/graphql/generated/graphql";

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
  certificationOptions?: Partial<Certification>;
}) {
  const certification = createCertificationEntity(options.certificationOptions);
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
    warningOnFeasibilitySubmission: "NONE",
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

  test.describe("Certification expiration", () => {
    test.describe("when the certification has not expired", () => {
      const { candidacy } = createCandidacyFeasibilityWith({
        status: "PARCOURS_ENVOYE",
        certificationOptions: {
          rncpExpiresAt: new Date("2100-01-01").getTime(),
        },
      });

      test("it should not show the certification expired alert", async ({
        page,
        msw,
      }) => {
        await setupAndNavigateToFaisabilite(page, msw, candidacy);

        const errorBox = page.locator(
          '[data-testid="certification-expired-alert"]',
        );
        await expect(errorBox).not.toBeVisible();
      });

      test("the certification authority select should be enabled", async ({
        page,
        msw,
      }) => {
        await setupAndNavigateToFaisabilite(page, msw, candidacy);

        const certificationAuthoritySelect = page.locator(
          '[data-testid="certification-authority-select"] select',
        );
        await expect(certificationAuthoritySelect).toBeEnabled();
      });

      test("the upload form should be enabled", async ({ page, msw }) => {
        await setupAndNavigateToFaisabilite(page, msw, candidacy);

        const uploadForm = page.locator(
          '[data-testid="feasibility-upload-form"] input[name="feasibilityFile"]',
        );
        await expect(uploadForm).toBeEnabled();
      });
    });
  });

  test.describe("when the certification has expired", () => {
    const { candidacy } = createCandidacyFeasibilityWith({
      status: "PARCOURS_CONFIRME",
      certificationOptions: {
        rncpExpiresAt: new Date("2000-01-01").getTime(),
      },
    });
    test.describe("when the df decision is not final", () => {
      test("it should show the certification expired alert ", async ({
        page,
        msw,
      }) => {
        await setupAndNavigateToFaisabilite(page, msw, candidacy);

        await expect(
          page.locator('[data-testid="feasibility-upload-form"]'),
        ).toBeVisible();

        const errorBox = page.locator(
          '[data-testid="certification-expired-alert"]',
        );
        await expect(errorBox).toBeVisible();
        await expect(errorBox.locator("h3")).toContainText(
          "Le diplôme visé a expiré",
        );
      });

      test("the certification authority select should be disabled", async ({
        page,
        msw,
      }) => {
        await setupAndNavigateToFaisabilite(page, msw, candidacy);

        const certificationAuthoritySelect = page.locator(
          '[data-testid="certification-authority-select"] select',
        );
        await expect(certificationAuthoritySelect).toBeDisabled();
      });

      test("the upload form should be disabled", async ({ page, msw }) => {
        await setupAndNavigateToFaisabilite(page, msw, candidacy);

        const uploadForm = page.locator(
          '[data-testid="feasibility-upload-form"] input[name="feasibilityFile"]',
        );
        await expect(uploadForm).toBeDisabled();
      });
    });

    test.describe("when the df decision is final", () => {
      [
        {
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          decision: "ADMISSIBLE" as const,
          decisionAlertTestId: "feasibility-decision-admissible",
        },
        {
          status: "DOSSIER_FAISABILITE_NON_RECEVABLE",
          decision: "REJECTED" as const,
          decisionAlertTestId: "feasibility-decision-rejected",
        },
      ].forEach(({ status, decision, decisionAlertTestId }) => {
        test(`it should not show the certification expired alert when the df decision is ${status}`, async ({
          page,
          msw,
        }) => {
          const { candidacy } = createCandidacyFeasibilityWith({
            status: "DOSSIER_FAISABILITE_RECEVABLE",
            certificationOptions: {
              rncpExpiresAt: new Date("2000-01-01").getTime(),
            },
            feasibilityOptions: {
              decision,
            },
          });

          await setupAndNavigateToFaisabilite(page, msw, candidacy);

          await expect(
            page.locator(`[data-testid="${decisionAlertTestId}"]`),
          ).toBeVisible();

          const errorBox = page.locator(
            '[data-testid="certification-expired-alert"]',
          );

          await expect(errorBox).not.toBeVisible();
        });

        test(`it should disable the certification authority select when the df decision is ${status}`, async ({
          page,
          msw,
        }) => {
          await setupAndNavigateToFaisabilite(page, msw, candidacy);

          const certificationAuthoritySelect = page.locator(
            '[data-testid="certification-authority-select"] select',
          );
          await expect(certificationAuthoritySelect).toBeDisabled();
        });

        test(`it should disable the upload form when the df decision is ${status}`, async ({
          page,
          msw,
        }) => {
          await setupAndNavigateToFaisabilite(page, msw, candidacy);

          const uploadForm = page.locator(
            '[data-testid="feasibility-upload-form"] input[name="feasibilityFile"]',
          );
          await expect(uploadForm).toBeDisabled();
        });
      });
    });
  });
});
