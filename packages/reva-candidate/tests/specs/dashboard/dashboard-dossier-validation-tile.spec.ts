import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  createCandidacyEntity,
  type CreateCandidacyEntityOptions,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createDossierDeValidationEntity } from "@tests/helpers/entities/create-dossier-de-validation.entity";
import { createFeasibilityEntity } from "@tests/helpers/entities/create-feasibility.entity";
import { createJuryEntity } from "@tests/helpers/entities/create-jury.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";

import type { JuryResult } from "@/graphql/generated/graphql";

import type { MswFixture } from "next/experimental/testmode/playwright/msw";
import type { Page } from "playwright";

const candidate = createCandidateEntity();

const setupDashboard = async (
  page: Page,
  msw: MswFixture,
  candidacyOptions: CreateCandidacyEntityOptions = {},
) => {
  const candidacy = createCandidacyEntity({
    candidate,
    typeAccompagnement: "ACCOMPAGNE",
    ...candidacyOptions,
  });
  const { handlers, dashboardWait } = dashboardHandlers({ candidacy });
  msw.use(...handlers);

  await login(page);
  await dashboardWait(page);
};

test("should display pending dossier validation badge", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    activeDossierDeValidation: createDossierDeValidationEntity({
      decision: "PENDING",
    }),
  });

  await expect(
    page.getByTestId("dossier-validation-badge-pending"),
  ).toBeVisible();
});

test("should display incomplete dossier validation badge", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    activeDossierDeValidation: createDossierDeValidationEntity({
      decision: "INCOMPLETE",
    }),
  });

  await expect(
    page.getByTestId("dossier-validation-badge-incomplete"),
  ).toBeVisible();
});

test("should display 'to send' dossier validation badge when not sent yet and DF is admissible", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    activeDossierDeValidation: null,
    feasibility: createFeasibilityEntity({
      decision: "ADMISSIBLE",
    }),
  });

  await expect(
    page.getByTestId("dossier-validation-badge-to-send"),
  ).toBeVisible();
});

test("should display 'to send' dossier validation badge when decision is INCOMPLETE and DF is admissible", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    activeDossierDeValidation: createDossierDeValidationEntity({
      decision: "INCOMPLETE",
    }),
    feasibility: createFeasibilityEntity({
      decision: "ADMISSIBLE",
    }),
  });

  await expect(
    page.getByTestId("dossier-validation-badge-to-send"),
  ).toBeVisible();
});

const failedJuryResults: JuryResult[] = [
  "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
  "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
  "FAILURE",
  "CANDIDATE_EXCUSED",
  "CANDIDATE_ABSENT",
];

for (const juryResult of failedJuryResults) {
  test(`should display 'to send' dossier validation badge when jury result is ${juryResult}`, async ({
    page,
    msw,
  }) => {
    await setupDashboard(page, msw, {
      jury: createJuryEntity({ result: juryResult }),
    });

    await expect(
      page.getByTestId("dossier-validation-badge-to-send"),
    ).toBeVisible();
  });
}
