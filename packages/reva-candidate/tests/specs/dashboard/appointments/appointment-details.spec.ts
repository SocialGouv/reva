import { expect, test } from "next/experimental/testmode/playwright/msw";

import { formatIso8601Date } from "@/utils/formatIso8601Date";
import { formatIso8601Time } from "@/utils/formatIso8601Time";
import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import {
  appointmentDetailsHandlers,
  navigateToAppointmentDetailsPage,
} from "@tests/helpers/handlers/appointments/appointment-details.handler";

import {
  Appointment,
  Candidacy,
  Candidate,
  Organism,
} from "@/graphql/generated/graphql";

test.describe("Appointment details page", () => {
  const candidate = createCandidateEntity({}) as Candidate;
  const organism = createOrganismEntity({}) as Organism;
  const candidacy = createCandidacyEntity({
    candidate,
    organism,
  }) as Candidacy;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);
  const appointment = {
    id: "1",
    title: "Rendez-vous 1",
    date: futureDate.toISOString(),
    type: "RENDEZ_VOUS_PEDAGOGIQUE",
    temporalStatus: "UPCOMING",
    duration: "ONE_HOUR",
    location: "Test Location",
    description: "Test Description",
  } as Appointment;

  const { handlers, appointmentDetailsWait } = appointmentDetailsHandlers({
    candidacy,
    appointment,
  });

  test.use({
    mswHandlers: [handlers, { scope: "test" }],
  });

  test("should display the appointment detail page with correct title", async ({
    page,
  }) => {
    await login(page);
    await navigateToAppointmentDetailsPage(
      page,
      candidate.id,
      candidacy.id,
      appointment.id,
    );

    await appointmentDetailsWait(page);
    await expect(
      page.getByRole("heading", { name: appointment.title }),
    ).toBeVisible();
  });

  test("should display the appointment card with correct information", async ({
    page,
  }) => {
    await login(page);
    await navigateToAppointmentDetailsPage(
      page,
      candidate.id,
      candidacy.id,
      appointment.id,
    );

    await appointmentDetailsWait(page);
    await expect(
      page.locator('[data-testid="rendez-vous-generique-tile"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="rendez-vous-generique-tile"] h3'),
    ).toHaveText(
      `${formatIso8601Date(appointment.date)} - ${formatIso8601Time(appointment.date)}`,
    );
    await expect(
      page.locator(
        '[data-testid="rendez-vous-generique-tile"] .fr-tile__start',
      ),
    ).toHaveText("Rendez-vous pédagogique");
  });

  test("appointment details table should have correct information", async ({
    page,
  }) => {
    await login(page);
    await navigateToAppointmentDetailsPage(
      page,
      candidate.id,
      candidacy.id,
      appointment.id,
    );

    await appointmentDetailsWait(page);
    await expect(
      page.locator('[data-testid="appointment-organized-by"]'),
    ).toHaveText(organism.nomPublic || organism.label);
    await expect(
      page.locator('[data-testid="appointment-location"]'),
    ).toHaveText(appointment.location!);
    await expect(
      page.locator('[data-testid="appointment-description"]'),
    ).toHaveText(appointment.description!);
    await expect(
      page.locator('[data-testid="appointment-duration"]'),
    ).toHaveText("1 heure");
  });
});

test.describe("Appointment details with missing optional info", () => {
  const candidate = createCandidateEntity({}) as Candidate;
  const organism = createOrganismEntity({}) as Organism;
  const candidacy = createCandidacyEntity({
    candidate,
    organism,
  }) as Candidacy;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);
  const appointment = {
    id: "1",
    title: "Rendez-vous 1",
    date: futureDate.toISOString(),
    type: "RENDEZ_VOUS_PEDAGOGIQUE",
    temporalStatus: "UPCOMING",
  } as Appointment;

  const { handlers, appointmentDetailsWait } = appointmentDetailsHandlers({
    candidacy,
    appointment,
  });

  test.use({
    mswHandlers: [handlers, { scope: "test" }],
  });

  test("should display explanation for missing optional info", async ({
    page,
  }) => {
    await login(page);
    await navigateToAppointmentDetailsPage(
      page,
      candidate.id,
      candidacy.id,
      appointment.id,
    );

    await appointmentDetailsWait(page);
    await expect(
      page.locator('[data-testid="appointment-location"]'),
    ).toHaveText(
      "Non renseigné, pour plus d’information contactez la personne à l’initiative de ce rendez-vous.",
    );
    await expect(
      page.locator('[data-testid="appointment-description"]'),
    ).toHaveText(
      "Non renseigné, pour plus d’information contactez la personne à l’initiative de ce rendez-vous.",
    );
    await expect(
      page.locator('[data-testid="appointment-duration"]'),
    ).toHaveText(
      "Non renseigné, pour plus d’information contactez la personne à l’initiative de ce rendez-vous.",
    );
  });
});
