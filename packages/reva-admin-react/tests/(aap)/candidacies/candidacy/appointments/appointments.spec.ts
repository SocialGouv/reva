import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

import type { Page } from "@playwright/test";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";
const APPOINTMENT_ID = "6c814f7c-09a0-4621-9a0e-5bf5212696c8";

function createAppointmentHandlers(args?: {
  withRendezVousPedagogique?: boolean;
  withPastRendezVousPedagogique?: boolean;
}) {
  const withRendezVousPedagogique = args?.withRendezVousPedagogique ?? false;
  const withPastRendezVousPedagogique =
    args?.withPastRendezVousPedagogique ?? false;

  const upcomingAppointments = withRendezVousPedagogique
    ? {
        rows: [
          {
            id: APPOINTMENT_ID,
            type: "RENDEZ_VOUS_PEDAGOGIQUE",
            title: "Rendez-vous pédagogique",
            date: "2225-01-01T09:00:00.000Z",
            temporalStatus: "UPCOMING",
          },
        ],
        info: {
          totalRows: 1,
          currentPage: 1,
          totalPages: 1,
        },
      }
    : {
        rows: [],
        info: {
          totalRows: 0,
          currentPage: 1,
          totalPages: 1,
        },
      };

  const pastAppointments = withPastRendezVousPedagogique
    ? {
        rows: [
          {
            id: APPOINTMENT_ID,
            type: "RENDEZ_VOUS_PEDAGOGIQUE",
            title: "Rendez-vous pédagogique",
            date: "2025-01-01T09:00:00.000Z",
            temporalStatus: "PAST",
          },
        ],
        info: {
          totalRows: 1,
          currentPage: 1,
          totalPages: 1,
        },
      }
    : {
        rows: [],
        info: {
          totalRows: 0,
          currentPage: 1,
          totalPages: 1,
        },
      };

  const rendezVousPedagogiqueAppointments =
    withRendezVousPedagogique || withPastRendezVousPedagogique
      ? {
          rows: [
            {
              id: APPOINTMENT_ID,
            },
          ],
          info: {
            totalRows: 1,
            currentPage: 1,
            totalPages: 1,
          },
        }
      : {
          rows: [],
          info: {
            totalRows: 0,
            currentPage: 1,
            totalPages: 1,
          },
        };

  return [
    fvae.query(
      "getCandidacyAndUpcomingAppointmentsForAppointmentsPage",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          appointments: upcomingAppointments,
        },
      }),
    ),
    fvae.query(
      "getCandidacyAndPastAppointmentsForAppointmentsPage",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          appointments: pastAppointments,
        },
      }),
    ),
    fvae.query(
      "getRendezVousPedagogiqueForAppointmentsPage",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          appointments: rendezVousPedagogiqueAppointments,
        },
      }),
    ),
  ];
}

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

async function waitForAppointmentQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "getCandidacyAndUpcomingAppointmentsForAppointmentsPage"),
    waitGraphQL(page, "getCandidacyAndPastAppointmentsForAppointmentsPage"),
    waitGraphQL(page, "getRendezVousPedagogiqueForAppointmentsPage"),
  ]);
}

async function waitForAllQueries(page: Page) {
  await Promise.all([aapCommonWait(page), waitForAppointmentQueries(page)]);
}

test.describe("appointments page", () => {
  test.describe("when I access the candidacy appointments page", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createAppointmentHandlers()],
        { scope: "test" },
      ],
    });

    test("show the correct title", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/appointments/`);
      await waitForAllQueries(page);

      await expect(
        page.getByTestId("appointments-page").getByRole("heading", {
          level: 1,
        }),
      ).toHaveText("Gestion des rendez-vous");
    });
  });

  test.describe("when there are appointments", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createAppointmentHandlers({ withRendezVousPedagogique: true }),
        ],
        { scope: "test" },
      ],
    });

    test("show the appointments", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/appointments/`);
      await waitForAllQueries(page);

      const upcomingList = page.getByTestId("upcoming-appointments-list");
      await expect(upcomingList.locator("li")).toHaveCount(1);
    });

    test("leads me to the appointment details page when I click on the appointment", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/appointments/`);
      await waitForAllQueries(page);

      const upcomingList = page.getByTestId("upcoming-appointments-list");
      const firstAppointment = upcomingList.locator("li").first();
      await expect(firstAppointment).not.toHaveAttribute("href");

      await firstAppointment.click();
      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}/`,
      );
    });

    test("let me click on the 'add appointment' button", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/appointments/`);
      await waitForAllQueries(page);

      await page.getByRole("link", { name: "Ajouter un rendez-vous" }).click();
      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/add-appointment/?type=RENDEZ_VOUS_DE_SUIVI`,
      );
    });
  });

  test.describe("when there are no appointment", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createAppointmentHandlers({ withRendezVousPedagogique: false }),
        ],
        { scope: "test" },
      ],
    });

    test("disable the 'add appointment' button", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/appointments/`);
      await waitForAllQueries(page);

      await expect(
        page.getByRole("button", { name: "Ajouter un rendez-vous" }),
      ).toBeDisabled();
    });

    test("shows the 'add first appointment' card", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/appointments/`);
      await waitForAllQueries(page);

      await expect(
        page.getByTestId("add-first-appointment-card"),
      ).toBeVisible();
    });

    test("leads me to the add appointment page when I click on the 'add first appointment' card", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/appointments/`);
      await waitForAllQueries(page);

      await page.getByTestId("add-first-appointment-card").click();
      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/add-appointment/?type=RENDEZ_VOUS_PEDAGOGIQUE`,
      );
    });
  });
});
