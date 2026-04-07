import { addDays, format, subDays } from "date-fns";
import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createDossierDeValidationEntity } from "@tests/helpers/entities/create-dossier-de-validation.entity";
import { createJuryEntity } from "@tests/helpers/entities/create-jury.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";

import type { Appointment, AppointmentType } from "@/graphql/generated/graphql";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import type { MswFixture } from "next/experimental/testmode/playwright/msw";
import type { Page } from "playwright";

function createAppointment(type: AppointmentType): Appointment {
  return {
    id: "1",
    title: "Rendez-vous 1",
    date: format(addDays(new Date(), 5), "yyyy-MM-dd"),
    type,
    temporalStatus: "UPCOMING",
  };
}

function createAppointmentPage(type: AppointmentType) {
  return {
    rows: [createAppointment(type)],
    info: {
      currentPage: 1,
      pageLength: 10,
      totalRows: 1,
      totalPages: 1,
    },
  };
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

test.describe("NoRendezVousTile", () => {
  test("should display when no appointments exist", async ({ page, msw }) => {
    const candidacy = createCandidacyEntity({
      candidate: createCandidateEntity(),
      typeAccompagnement: "ACCOMPAGNE",
    });

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("no-rendez-vous-tile")).toBeVisible();
    await expect(page.getByTestId("rendez-vous-generique-tile")).toHaveCount(0);
    await expect(page.getByTestId("jury-session-tile")).toHaveCount(0);
  });
});

test.describe("RendezVousGeneriqueTile", () => {
  test("should display when there is an appointment in the future", async ({
    page,
    msw,
  }) => {
    const candidacy = createCandidacyEntity({
      candidate: createCandidateEntity(),
      typeAccompagnement: "ACCOMPAGNE",
      appointments: createAppointmentPage("RENDEZ_VOUS_PEDAGOGIQUE"),
    });

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("rendez-vous-generique-tile")).toBeVisible();
    await expect(page.getByTestId("no-rendez-vous-tile")).toHaveCount(0);
  });

  test("should display 'tous mes rendez-vous' button when there is at least one appointment, whether past or future", async ({
    page,
    msw,
  }) => {
    const candidacy = createCandidacyEntity({
      candidate: createCandidateEntity(),
      typeAccompagnement: "ACCOMPAGNE",
    });

    candidacy.firstAppointmentOccuredAt = format(
      subDays(new Date(), 5),
      "yyyy-MM-dd",
    );

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("all-appointments-button")).toBeVisible();
  });

  test("should display tag with correct appointment type", async ({
    page,
    msw,
  }) => {
    const candidacy = createCandidacyEntity({
      candidate: createCandidateEntity(),
      typeAccompagnement: "ACCOMPAGNE",
      appointments: createAppointmentPage("RENDEZ_VOUS_DE_SUIVI"),
    });

    await setupDashboard(page, msw, candidacy);

    const appointmentTile = page.getByTestId("rendez-vous-generique-tile");

    await expect(appointmentTile).toBeVisible();
    await expect(
      appointmentTile.getByText("Rendez-vous de suivi", { exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("no-rendez-vous-tile")).toHaveCount(0);
  });
});

test.describe("JurySessionTile", () => {
  test("should display when jury session is in the future", async ({
    page,
    msw,
  }) => {
    const candidacy = createCandidacyEntity({
      candidate: createCandidateEntity(),
      typeAccompagnement: "ACCOMPAGNE",
      jury: createJuryEntity({
        dateOfSession: addDays(new Date(), 20).getTime(),
        timeSpecified: false,
      }),
    });

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("jury-session-tile")).toBeVisible();
    await expect(page.getByTestId("no-rendez-vous-tile")).toHaveCount(0);
  });

  test("should not display when jury session date is in the past", async ({
    page,
    msw,
  }) => {
    const candidacy = createCandidacyEntity({
      candidate: createCandidateEntity(),
      typeAccompagnement: "ACCOMPAGNE",
      jury: createJuryEntity({
        dateOfSession: subDays(new Date(), 5).getTime(),
        timeSpecified: true,
      }),
    });

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("jury-session-tile")).toHaveCount(0);
    await expect(page.getByTestId("no-rendez-vous-tile")).toBeVisible();
  });
});

test.describe("Multiple Appointment Tiles", () => {
  test("should display all relevant tiles when multiple appointments exist", async ({
    page,
    msw,
  }) => {
    const candidacy = createCandidacyEntity({
      candidate: createCandidateEntity(),
      typeAccompagnement: "ACCOMPAGNE",
      appointments: createAppointmentPage("RENDEZ_VOUS_PEDAGOGIQUE"),
      activeDossierDeValidation: createDossierDeValidationEntity({
        decision: "INCOMPLETE",
      }),
      jury: createJuryEntity({
        dateOfSession: addDays(new Date(), 60).getTime(),
        timeSpecified: true,
      }),
    });

    await setupDashboard(page, msw, candidacy);

    await expect(page.getByTestId("rendez-vous-generique-tile")).toBeVisible();
    await expect(page.getByTestId("jury-session-tile")).toBeVisible();
    await expect(page.getByTestId("no-rendez-vous-tile")).toHaveCount(0);
  });
});
