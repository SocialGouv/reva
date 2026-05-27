import { addDays, format, subDays } from "date-fns";
import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  createCandidacyEntity,
  type CreateCandidacyEntityOptions,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";

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
    ...candidacyOptions,
  });
  const { handlers, dashboardWait } = dashboardHandlers({ candidacy });
  msw.use(...handlers);

  await login(page);
  await dashboardWait(page);
};

test("should be disabled when candidacy status is PROJET", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    status: "PROJET",
    typeAccompagnement: "ACCOMPAGNE",
  });

  await expect(
    page.getByTestId("training-tile").getByRole("button"),
  ).toBeDisabled();
});

test("should be disabled when candidacy status is VALIDATION", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    status: "VALIDATION",
    typeAccompagnement: "ACCOMPAGNE",
  });

  await expect(
    page.getByTestId("training-tile").getByRole("button"),
  ).toBeDisabled();
});

test("should be disabled when candidacy status is PRISE_EN_CHARGE and first appointment is in the future", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    status: "PRISE_EN_CHARGE",
    typeAccompagnement: "ACCOMPAGNE",
    firstAppointmentOccuredAt: format(addDays(new Date(), 5), "yyyy-MM-dd"),
  });

  await expect(
    page.getByTestId("training-tile").getByRole("button"),
  ).toBeDisabled();
});

test("should show 'en cours' badge when candidacy status is PRISE_EN_CHARGE and first appointment is passed", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    status: "PRISE_EN_CHARGE",
    typeAccompagnement: "ACCOMPAGNE",
    firstAppointmentOccuredAt: format(subDays(new Date(), 5), "yyyy-MM-dd"),
  });

  await expect(
    page.getByTestId("training-status-badge-in-progress"),
  ).toBeVisible();
});

test("should show 'en cours' badge when candidacy status is VALIDATION and first appointment is passed", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    status: "VALIDATION",
    typeAccompagnement: "ACCOMPAGNE",
    firstAppointmentOccuredAt: format(subDays(new Date(), 5), "yyyy-MM-dd"),
  });

  await expect(
    page.getByTestId("training-status-badge-in-progress"),
  ).toBeVisible();
});

test("should show 'to validate' badge when status is PARCOURS_ENVOYE", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    status: "PARCOURS_ENVOYE",
    typeAccompagnement: "ACCOMPAGNE",
    firstAppointmentOccuredAt: format(subDays(new Date(), 5), "yyyy-MM-dd"),
  });

  await expect(
    page.getByTestId("training-status-badge-to-validate"),
  ).toBeVisible();
});

test("should show 'validated' badge when status is PARCOURS_CONFIRME", async ({
  page,
  msw,
}) => {
  await setupDashboard(page, msw, {
    status: "PARCOURS_CONFIRME",
    typeAccompagnement: "ACCOMPAGNE",
  });

  await expect(
    page.getByTestId("training-status-badge-validated"),
  ).toBeVisible();
});
