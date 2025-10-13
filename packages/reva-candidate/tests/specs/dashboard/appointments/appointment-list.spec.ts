import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import {
  appointmentListHandlers,
  navigateToAppointmentListPage,
} from "@tests/helpers/handlers/appointments/appointment-list.handler";

import { Candidacy } from "@/graphql/generated/graphql";

const createCandidacyWithAppointments = () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);
  const candidacy = createCandidacyEntity({
    appointments: {
      rows: [
        {
          id: "1",
          title: "Rendez-vous 1",
          date: futureDate.toISOString(),
          type: "RENDEZ_VOUS_PEDAGOGIQUE",
          temporalStatus: "UPCOMING",
        },
        {
          id: "2",
          title: "Rendez-vous 2",
          date: futureDate.toISOString(),
          type: "RENDEZ_VOUS_DE_SUIVI",
          temporalStatus: "UPCOMING",
        },
        {
          id: "3",
          title: "Rendez-vous 3",
          date: pastDate.toISOString(),
          type: "RENDEZ_VOUS_PEDAGOGIQUE",
          temporalStatus: "PAST",
        },
      ],
      info: {
        currentPage: 1,
        pageLength: 10,
        totalRows: 3,
        totalPages: 1,
      },
    },
  }) as Candidacy;

  return candidacy;
};

test.describe("Appointment list for candidacy with past appointments", () => {
  const candidacy = createCandidacyWithAppointments();
  const { handlers, appointmentListWait } = appointmentListHandlers({
    candidacy,
  });

  test.use({
    mswHandlers: [handlers, { scope: "test" }],
  });

  test("should display the list of future appointments", async ({ page }) => {
    await login(page);
    await navigateToAppointmentListPage(page, candidacy.id);

    await appointmentListWait(page);
    await expect(
      page.getByRole("heading", { name: "Mes prochains rendez-vous" }),
    ).toBeVisible();
    for (const app of candidacy.appointments.rows) {
      await expect(
        page.locator(`[data-test="future-appointment-${app.id}"]`),
      ).toBeVisible();
      await expect(
        page.locator(`[data-test="future-appointment-${app.id}"] h3`),
      ).toHaveText(app.title);
    }
  });

  test("should display past appointments accordion when there are past appointments", async ({
    page,
  }) => {
    await login(page);
    await navigateToAppointmentListPage(page, candidacy.id);

    await appointmentListWait(page);
    await expect(
      page.getByRole("heading", { name: "Rendez-vous passés" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Rendez-vous passés" }).click();

    for (const app of candidacy.appointments.rows) {
      if (app.temporalStatus === "PAST") {
        await expect(
          page.locator(`[data-test="past-appointment-${app.id}"]`),
        ).toBeVisible();
        await expect(
          page.locator(`[data-test="past-appointment-${app.id}"] h3`),
        ).toHaveText(app.title);
      }
    }
  });
});

test.describe("Appointment list for candidacy without past appointments", () => {
  const candidacy = createCandidacyWithAppointments();

  const { handlers, appointmentListWait } = appointmentListHandlers({
    candidacy,
    hasPastAppointments: false,
  });

  test.use({
    mswHandlers: [handlers, { scope: "test" }],
  });

  test("should not display past appointments accordion when there are no past appointments", async ({
    page,
  }) => {
    await login(page);
    await navigateToAppointmentListPage(page, candidacy.id);

    await appointmentListWait(page);
    await expect(
      page.getByRole("heading", { name: "Rendez-vous passés" }),
    ).not.toBeVisible();
  });
});
