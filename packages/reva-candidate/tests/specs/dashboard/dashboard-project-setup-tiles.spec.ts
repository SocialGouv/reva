import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  createCandidacyEntity,
  type CandidacyEntity,
  type CreateCandidacyEntityOptions,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
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
});

const createDashboardCandidacy = (options: CreateCandidacyEntityOptions = {}) =>
  createCandidacyEntity({
    candidate,
    ...options,
  });

const setupDashboard = async (
  page: Page,
  msw: MswFixture,
  candidacy: CandidacyEntity,
) => {
  const { handlers, dashboardWait } = dashboardHandlers({ candidacy });
  msw.use(...handlers);

  await login(page);
  await dashboardWait(page);
};

test.describe("Completion Tiles", () => {
  const requiredFields = [
    "certification",
    "goals",
    "experiences",
    "organism",
  ] as const;
  const completedFieldOptions = {
    certification: { certification },
    goals: { goalsCount: 1 },
    experiences: { experiencesCount: 1 },
    organism: { organism },
  };

  test("should display 'to complete' badges on tiles when all parts are incomplete", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      status: "PROJET",
      typeAccompagnement: "ACCOMPAGNE",
      certification: null,
      goalsCount: 0,
      experiencesCount: 0,
      organism: null,
    });

    await setupDashboard(page, msw, candidacy);

    await expect(
      page.getByTestId("certification-tile").getByTestId("incomplete-badge"),
    ).toBeVisible();
    await expect(
      page.getByTestId("goals-tile").getByTestId("incomplete-badge"),
    ).toBeVisible();
    await expect(
      page.getByTestId("experiences-tile").getByTestId("incomplete-badge"),
    ).toBeVisible();
    await expect(
      page.getByTestId("organism-tile").getByTestId("incomplete-badge"),
    ).toBeVisible();
    await expect(
      page.getByTestId("submit-candidacy-tile").getByRole("button"),
    ).toBeDisabled();
  });

  for (const field of requiredFields) {
    test(`should display completed badge when ${field} is complete`, async ({
      page,
      msw,
    }) => {
      const candidacy = createDashboardCandidacy({
        status: "PROJET",
        typeAccompagnement: "ACCOMPAGNE",
        certification: null,
        goalsCount: 0,
        experiencesCount: 0,
        organism: null,
        ...completedFieldOptions[field],
      });

      await setupDashboard(page, msw, candidacy);

      await expect(
        page.getByTestId(`${field}-tile`).getByTestId("incomplete-badge"),
      ).toHaveCount(0);
      await expect(
        page.getByTestId("submit-candidacy-tile").getByRole("button"),
      ).toBeDisabled();
    });
  }

  test("should let candidate submit candidacy when all parts are completed", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      status: "PROJET",
      certification,
      goalsCount: 1,
      experiencesCount: 1,
      organism,
    });

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("submit-candidacy-tile")).toContainText(
      "Vérifier et envoyer",
    );
    await expect(
      page.getByTestId("submit-candidacy-tile").getByTestId("to-send-badge"),
    ).toBeVisible();
    await expect(
      page.getByTestId("submit-candidacy-tile").getByRole("button"),
    ).toBeEnabled();
  });
});

test.describe("Certification Tile", () => {
  test("should be readOnly and display 'Consulter' for AUTONOME after feasibilityFileSentAt", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      status: "PROJET",
      typeAccompagnement: "AUTONOME",
      certification,
      feasibility: createFeasibilityEntity({
        feasibilityFileSentAt: Date.now(),
      }),
    });

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("certification-tile")).toContainText(
      "Consulter",
    );
    await expect(
      page.getByTestId("certification-tile").getByTestId("incomplete-badge"),
    ).toHaveCount(0);
    await expect(
      page.getByTestId("certification-tile").getByRole("link"),
    ).toBeVisible();
  });

  test("should be readOnly and display 'Consulter' for ACCOMPAGNE after PARCOURS_CONFIRME", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      status: "PARCOURS_CONFIRME",
      typeAccompagnement: "ACCOMPAGNE",
      certification,
    });

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("certification-tile")).toContainText(
      "Consulter",
    );
    await expect(
      page.getByTestId("certification-tile").getByTestId("incomplete-badge"),
    ).toHaveCount(0);
    await expect(
      page.getByTestId("certification-tile").getByRole("link"),
    ).toBeVisible();
  });
});

test.describe("Type Accompagnement Tile", () => {
  test("should display 'to complete' badge when typeAccompagnement is not selected", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      status: "PROJET",
    });
    candidacy.typeAccompagnement = null;

    await setupDashboard(page, msw, candidacy);

    await expect(
      page
        .getByTestId("type-accompagnement-tile")
        .getByTestId("incomplete-badge"),
    ).toBeVisible();
  });

  test("should not display 'to complete' badge when typeAccompagnement is selected", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      status: "PROJET",
      typeAccompagnement: "AUTONOME",
    });

    await setupDashboard(page, msw, candidacy);

    await expect(
      page
        .getByTestId("type-accompagnement-tile")
        .getByTestId("incomplete-badge"),
    ).toHaveCount(0);
  });

  test("should be disabled for AUTONOME after feasibilityFileSentAt", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      status: "PROJET",
      typeAccompagnement: "AUTONOME",
      feasibility: createFeasibilityEntity({
        feasibilityFileSentAt: Date.now(),
      }),
    });

    await setupDashboard(page, msw, candidacy);

    await expect(
      page.getByTestId("type-accompagnement-tile").getByRole("button"),
    ).toBeVisible();
    await expect(
      page.getByTestId("type-accompagnement-tile"),
    ).not.toContainText("Consulter");
    await expect(
      page
        .getByTestId("type-accompagnement-tile")
        .getByTestId("incomplete-badge"),
    ).toHaveCount(0);
  });

  test("should be disabled for ACCOMPAGNE after PARCOURS_CONFIRME", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      status: "PARCOURS_CONFIRME",
      typeAccompagnement: "ACCOMPAGNE",
    });

    await setupDashboard(page, msw, candidacy);

    await expect(
      page.getByTestId("type-accompagnement-tile").getByRole("button"),
    ).toBeVisible();
    await expect(
      page.getByTestId("type-accompagnement-tile"),
    ).not.toContainText("Consulter");
    await expect(
      page
        .getByTestId("type-accompagnement-tile")
        .getByTestId("incomplete-badge"),
    ).toHaveCount(0);
  });

  test("should be disabled for ACCOMPAGNE after feasibilityFileSentAt", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      status: "PARCOURS_CONFIRME",
      typeAccompagnement: "ACCOMPAGNE",
      feasibility: createFeasibilityEntity({
        feasibilityFileSentAt: Date.now(),
      }),
    });

    await setupDashboard(page, msw, candidacy);

    await expect(
      page.getByTestId("type-accompagnement-tile").getByRole("button"),
    ).toBeVisible();
    await expect(
      page.getByTestId("type-accompagnement-tile"),
    ).not.toContainText("Consulter");
  });

  test("should display 'Modifier' when typeAccompagnement is selected and not disabled", async ({
    page,
    msw,
  }) => {
    const candidacy = createDashboardCandidacy({
      status: "PROJET",
      typeAccompagnement: "AUTONOME",
    });

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("type-accompagnement-tile")).toContainText(
      "Modifier",
    );
  });
});
