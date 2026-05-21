import { addDays, format, subMonths } from "date-fns";
import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  createCandidacyEntity,
  type CreateCandidacyEntityOptions,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createDossierDeValidationEntity } from "@tests/helpers/entities/create-dossier-de-validation.entity";
import { createFeasibilityEntity } from "@tests/helpers/entities/create-feasibility.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";

import type { MswFixture } from "next/experimental/testmode/playwright/msw";
import type { Page } from "playwright";

const candidate = createCandidateEntity();
const certification = createCertificationEntity({
  id: "cert-id",
  label: "Test Certification",
  codeRncp: "12345",
});
const organism = createOrganismEntity({
  id: "org-id",
  label: "Test Organism",
  nomPublic: "Public Name",
});

const createDashboardCandidacy = (options: CreateCandidacyEntityOptions = {}) =>
  createCandidacyEntity({
    candidate,
    ...options,
  });

const setupDashboard = async (
  page: Page,
  msw: MswFixture,
  candidacyOptions: CreateCandidacyEntityOptions = {},
) => {
  const candidacy = createDashboardCandidacy(candidacyOptions);
  const { handlers, dashboardWait } = dashboardHandlers({ candidacy });
  msw.use(...handlers);

  await login(page);
  await dashboardWait(page);
};

test.describe("Completion Banner", () => {
  const requiredFields = [
    { field: "certification", options: { certification: null } },
    { field: "goals", options: { goalsCount: 0 } },
    { field: "experiences", options: { experiencesCount: 0 } },
    { field: "organism", options: { organism: null } },
  ] satisfies {
    field: string;
    options: CreateCandidacyEntityOptions;
  }[];

  test("should display need to complete info banner when all parts are incomplete", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      status: "PROJET",
      typeAccompagnement: "ACCOMPAGNE",
      certification: null,
      goalsCount: 0,
      experiencesCount: 0,
      organism: null,
    });

    await expect(
      page.getByTestId("need-to-complete-info-banner"),
    ).toBeVisible();
    await expect(page.getByTestId("can-submit-candidacy-banner")).toHaveCount(
      0,
    );
  });

  for (const fieldInfo of requiredFields) {
    test(`should display need to complete info banner when only ${fieldInfo.field} is incomplete`, async ({
      page,
      msw,
    }) => {
      await setupDashboard(page, msw, {
        status: "PROJET",
        typeAccompagnement: "ACCOMPAGNE",
        certification,
        goalsCount: 1,
        experiencesCount: 1,
        organism,
        ...fieldInfo.options,
      });

      await expect(
        page.getByTestId("need-to-complete-info-banner"),
      ).toBeVisible();
      await expect(page.getByTestId("can-submit-candidacy-banner")).toHaveCount(
        0,
      );
    });
  }

  test("should display can submit candidacy banner when all parts are completed", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      status: "PROJET",
      typeAccompagnement: "ACCOMPAGNE",
      certification,
      goalsCount: 1,
      experiencesCount: 1,
      organism,
    });

    await expect(page.getByTestId("need-to-complete-info-banner")).toHaveCount(
      0,
    );
    await expect(page.getByTestId("can-submit-candidacy-banner")).toBeVisible();
  });
});

test.describe("Drop Out Banner", () => {
  test("should not show decision button when drop out is confirmed", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      candidacyDropOut: {
        proofReceivedByAdmin: true,
        createdAt: new Date().toISOString(),
        dropOutConfirmedByCandidate: true,
      },
    });

    await expect(page.getByTestId("drop-out-warning")).toBeVisible();
    await expect(
      page.getByTestId("drop-out-warning-decision-button"),
    ).toHaveCount(0);
  });
});

test.describe("Validation Dossier Banners", () => {
  test("should display pending dossier validation banner", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      activeDossierDeValidation: createDossierDeValidationEntity({
        decision: "PENDING",
      }),
    });

    await expect(page.getByTestId("pending-dv-banner")).toBeVisible();
  });

  test("should display incomplete dossier validation banner", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      activeDossierDeValidation: createDossierDeValidationEntity({
        decision: "INCOMPLETE",
      }),
    });

    await expect(page.getByTestId("incomplete-dv-banner")).toBeVisible();
  });
});

test.describe("Feasibility Banners", () => {
  test("should display autonome admissible feasibility banner", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      feasibility: createFeasibilityEntity({ decision: "ADMISSIBLE" }),
      typeAccompagnement: "AUTONOME",
      readyForJuryEstimatedAt: null,
    });

    await expect(
      page.getByTestId("admissible-feasibility-banner"),
    ).toBeVisible();
  });

  test("should display accompagne admissible feasibility banner", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      feasibility: createFeasibilityEntity({ decision: "ADMISSIBLE" }),
      typeAccompagnement: "ACCOMPAGNE",
    });

    await expect(
      page.getByTestId("admissible-feasibility-banner"),
    ).toBeVisible();
  });

  test("should display draft feasibility banner", async ({ page, msw }) => {
    await setupDashboard(page, msw, {
      feasibility: createFeasibilityEntity({
        decision: "DRAFT",
        dematerializedFeasibilityFile: {
          sentToCandidateAt: Date.now(),
        },
      }),
      typeAccompagnement: "ACCOMPAGNE",
    });

    await expect(page.getByTestId("draft-feasibility-banner")).toBeVisible();
  });

  test("should display pending feasibility banner for accompanied candidacy", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      feasibility: createFeasibilityEntity({ decision: "PENDING" }),
      typeAccompagnement: "ACCOMPAGNE",
    });

    await expect(page.getByTestId("pending-feasibility-banner")).toBeVisible();
  });

  test("should display autonomous pending feasibility banner", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      feasibility: createFeasibilityEntity({ decision: "PENDING" }),
      typeAccompagnement: "AUTONOME",
    });

    await expect(
      page.getByTestId("autonome-pending-feasibility-banner"),
    ).toBeVisible();
  });

  test("should display incomplete feasibility banner for accompanied candidacy", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      feasibility: createFeasibilityEntity({ decision: "INCOMPLETE" }),
      typeAccompagnement: "ACCOMPAGNE",
    });

    await expect(
      page.getByTestId("incomplete-feasibility-banner"),
    ).toBeVisible();
  });

  test("should display autonomous incomplete feasibility banner", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      feasibility: createFeasibilityEntity({ decision: "INCOMPLETE" }),
      typeAccompagnement: "AUTONOME",
    });

    await expect(
      page.getByTestId("autonome-incomplete-feasibility-banner"),
    ).toBeVisible();
  });

  test("should display rejected feasibility banner", async ({ page, msw }) => {
    await setupDashboard(page, msw, {
      feasibility: createFeasibilityEntity({ decision: "REJECTED" }),
    });

    await expect(page.getByTestId("rejected-feasibility-banner")).toBeVisible();
  });
});

test.describe("Appointment Banners", () => {
  test("should display waiting for appointment banner", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      status: "PARCOURS_CONFIRME",
      firstAppointmentOccuredAt: null,
      typeAccompagnement: "ACCOMPAGNE",
    });

    await expect(
      page.getByTestId("waiting-for-appointment-banner"),
    ).toBeVisible();
  });

  test("should display first appointment scheduled banner", async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      status: "PARCOURS_CONFIRME",
      firstAppointmentOccuredAt: format(addDays(new Date(), 5), "yyyy-MM-dd"),
      organism,
    });

    await expect(
      page.getByTestId("first-appointment-scheduled-banner"),
    ).toBeVisible();
  });

  test("should display creating feasibility banner", async ({ page, msw }) => {
    await setupDashboard(page, msw, {
      status: "PARCOURS_CONFIRME",
      typeAccompagnement: "ACCOMPAGNE",
      firstAppointmentOccuredAt: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
      feasibility: createFeasibilityEntity({
        decision: "DRAFT",
        dematerializedFeasibilityFile: {
          sentToCandidateAt: null,
        },
      }),
    });

    await expect(page.getByTestId("creating-feasibility-banner")).toBeVisible();
  });

  test("should display waiting for training banner", async ({ page, msw }) => {
    await setupDashboard(page, msw, {
      status: "ANOTHER_STATUS",
      typeAccompagnement: "ACCOMPAGNE",
      firstAppointmentOccuredAt: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    });

    await expect(page.getByTestId("waiting-for-training-banner")).toBeVisible();
  });
});
