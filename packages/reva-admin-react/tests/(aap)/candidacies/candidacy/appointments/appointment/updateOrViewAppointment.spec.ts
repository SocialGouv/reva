import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../../shared/helpers/network/requests";

import type { Page } from "@playwright/test";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";
const APPOINTMENT_ID = "5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3";

function createUpdateOrViewAppointmentHandlers(args?: {
  rendezVousPedagogiqueTemporalStatus?: "UPCOMING" | "PAST";
  type?: "RENDEZ_VOUS_PEDAGOGIQUE" | "RENDEZ_VOUS_DE_SUIVI";
}) {
  const rendezVousPedagogiqueTemporalStatus =
    args?.rendezVousPedagogiqueTemporalStatus ?? "UPCOMING";
  const type = args?.type ?? "RENDEZ_VOUS_DE_SUIVI";

  return [
    fvae.query(
      "getCandidacyAndAppointmentForUpdateOrViewAppointmentPage",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          candidate: {
            id: "6c814f7c-09a0-4621-9a0e-5bf5212696c8",
            firstname: "John",
            lastname: "Doe",
          },
        },
        appointment_getAppointmentById: {
          id: APPOINTMENT_ID,
          type,
          title: "Rendez-vous de suivi",
          date: "2025-01-01T09:00:00.000Z",
          duration: "ONE_HOUR",
          location: "Test Location",
          description: "Test Description",
          temporalStatus: rendezVousPedagogiqueTemporalStatus,
        },
      }),
    ),
    fvae.mutation(
      "updateAppointmentForUpdateAppointmentPage",
      graphQLResolver({
        appointment_updateAppointment: {
          id: APPOINTMENT_ID,
        },
      }),
    ),
    fvae.mutation(
      "deleteAppointmentForUpdateAppointmentPage",
      graphQLResolver({
        appointment_deleteAppointment: {
          id: APPOINTMENT_ID,
        },
      }),
    ),
  ];
}

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

async function waitForUpdateOrViewAppointmentQueries(page: Page) {
  await waitGraphQL(
    page,
    "getCandidacyAndAppointmentForUpdateOrViewAppointmentPage",
  );
}

async function waitForAllQueries(page: Page) {
  await Promise.all([
    aapCommonWait(page),
    waitForUpdateOrViewAppointmentQueries(page),
  ]);
}

test.describe("when I access the candidacy add appointment page", () => {
  test.describe("when the appointment is upcoming", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createUpdateOrViewAppointmentHandlers()],
        { scope: "test" },
      ],
    });

    test("show the correct title", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}`,
      );
      await waitForAllQueries(page);

      await expect(
        page.getByTestId("update-appointments-page-title"),
      ).toHaveText("Rendez-vous de suivi de Doe John");
    });

    test("fill the field with the existing appointment values", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}`,
      );
      await waitForAllQueries(page);

      await expect(
        page.getByTestId("title-input").locator("input"),
      ).toHaveValue("Rendez-vous de suivi");
      await expect(page.getByTestId("date-input").locator("input")).toHaveValue(
        "2025-01-01",
      );
      await expect(page.getByTestId("time-input").locator("input")).toHaveValue(
        "10:00",
      );
      await expect(
        page.getByTestId("duration-input").locator("select"),
      ).toHaveValue("ONE_HOUR");
      await expect(
        page.getByTestId("location-input").locator("input"),
      ).toHaveValue("Test Location");
      await expect(
        page.getByTestId("description-input").locator("textarea"),
      ).toHaveValue("Test Description");
    });

    test("does not let me submit a pristine form", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}`,
      );
      await waitForAllQueries(page);

      await expect(page.locator("button[type='submit']")).toBeDisabled();
    });

    test("let me update the field and submit the form", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}`,
      );
      await waitForAllQueries(page);

      await page
        .getByTestId("title-input")
        .locator("input")
        .fill("Updated Appointment");
      await page.getByTestId("date-input").locator("input").fill("2027-01-01");
      await page.getByTestId("time-input").locator("input").fill("18:00");
      await page
        .getByTestId("duration-input")
        .locator("select")
        .selectOption("TWO_HOURS");
      await page
        .getByTestId("location-input")
        .locator("input")
        .fill("Updated Location");
      await page
        .getByTestId("description-input")
        .locator("textarea")
        .fill("Updated Description");

      const updatedAppointmentMutationPromise = waitGraphQL(
        page,
        "updateAppointmentForUpdateAppointmentPage",
      );

      await page.locator("button[type='submit']").click();

      await updatedAppointmentMutationPromise;

      await await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}/update-confirmation/`,
      );
    });

    test.describe("when the appointment is a rendez-vous de suivi", () => {
      test.use({
        mswHandlers: [
          [...aapCommonHandlers, ...createUpdateOrViewAppointmentHandlers()],
          { scope: "test" },
        ],
      });

      test("let me click on the delete button and redirect me to the delete confirmation page", async ({
        page,
      }) => {
        await login({ role: "aap", page });
        await page.goto(
          `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}`,
        );
        await waitForAllQueries(page);

        await page.getByTestId("delete-appointment-button").click();

        const deleteAppointmentMutationPromise = waitGraphQL(
          page,
          "deleteAppointmentForUpdateAppointmentPage",
        );
        await page
          .locator(".confirm-appointment-deletion-modal-button")
          .click();

        await deleteAppointmentMutationPromise;

        await expect(page).toHaveURL(
          new RegExp(
            `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}/delete-confirmation/\\?date=2025-01-01T09:00:00\\.000Z&candidateFirstName=John&candidateLastName=Doe`,
          ),
        );
      });
    });

    test.describe("when the appointment is a rendez-vous pedagogique", () => {
      test.use({
        mswHandlers: [
          [
            ...aapCommonHandlers,
            ...createUpdateOrViewAppointmentHandlers({
              type: "RENDEZ_VOUS_PEDAGOGIQUE",
            }),
          ],
          { scope: "test" },
        ],
      });

      test("does not show the delete button", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(
          `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}`,
        );
        await waitForAllQueries(page);

        await expect(
          page.locator('[data-testid="delete-appointment-button"]'),
        ).toHaveCount(0);
      });
    });
  });

  test.describe("when the appointment is past", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createUpdateOrViewAppointmentHandlers({
            rendezVousPedagogiqueTemporalStatus: "PAST",
          }),
        ],
        { scope: "test" },
      ],
    });

    test("show the correct title", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}`,
      );
      await waitForAllQueries(page);

      await expect(
        page.getByTestId("view-appointments-page").locator("h1"),
      ).toHaveText("Rendez-vous de suivi");
    });

    test("show the correct field values", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}`,
      );
      await waitForAllQueries(page);

      await expect(
        page.getByTestId("rendez-vous-pedagogique-tile").locator(".fr-tag"),
      ).toHaveText("Rendez-vous de suivi");
      await expect(
        page
          .getByTestId("rendez-vous-pedagogique-tile")
          .locator(".fr-tile__title"),
      ).toHaveText("01/01/2025 - 10:00");
      await expect(page.getByTestId("candidate-row")).toHaveText("Doe John");
      await expect(page.getByTestId("duration-row")).toHaveText("1 heure");
      await expect(page.getByTestId("location-row")).toHaveText(
        "Test Location",
      );
      await expect(page.getByTestId("description-row")).toHaveText(
        "Test Description",
      );
    });

    test("let me go back to the appointments page when i click on the back button", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}`,
      );
      await waitForAllQueries(page);

      await page.getByTestId("back-button").click();
      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/`,
      );
    });
  });
});
