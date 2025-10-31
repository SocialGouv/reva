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

function createAddAppointmentHandlers() {
  return [
    fvae.query(
      "getCandidacyForAddAppointmentPage",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          candidate: {
            id: "6c814f7c-09a0-4621-9a0e-5bf5212696c8",
            firstname: "John",
            lastname: "Doe",
          },
        },
      }),
    ),
    fvae.mutation(
      "createAppointmentForAddAppointmentPage",
      graphQLResolver({
        appointment_createAppointment: {
          id: APPOINTMENT_ID,
        },
      }),
    ),
  ];
}

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

async function waitForAddAppointmentQueries(page: Page) {
  await waitGraphQL(page, "getCandidacyForAddAppointmentPage");
}

async function waitForAllQueries(page: Page) {
  await Promise.all([aapCommonWait(page), waitForAddAppointmentQueries(page)]);
}

test.describe("add appointment page", () => {
  test.use({
    mswHandlers: [
      [...aapCommonHandlers, ...createAddAppointmentHandlers()],
      { scope: "test" },
    ],
  });

  test.describe("when I access the candidacy add appointment page", () => {
    test("show the correct page title", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/add-appointment/?type=RENDEZ_VOUS_PEDAGOGIQUE`,
      );
      await waitForAllQueries(page);

      await expect(page.getByTestId("add-appointments-page-title")).toHaveText(
        "Rendez-vous pédagogique de Doe John",
      );
    });

    test("show the correct form title", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/add-appointment/?type=RENDEZ_VOUS_PEDAGOGIQUE`,
      );
      await waitForAllQueries(page);

      await expect(
        page.getByTestId("title-input").locator("input"),
      ).toHaveValue("Rendez-vous pédagogique");
    });
  });

  test.describe("when I try to validate the form", () => {
    test("does not submit the form without a title, date and time", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/add-appointment/?type=RENDEZ_VOUS_DE_SUIVI`,
      );
      await waitForAllQueries(page);

      await page.getByTestId("title-input").locator("input").clear();

      await page.locator("button[type='submit']").click();

      await expect(page.getByTestId("title-input")).toHaveClass(
        /fr-input-group--error/,
      );
      await expect(page.getByTestId("date-input")).toHaveClass(
        /fr-input-group--error/,
      );
      await expect(page.getByTestId("time-input")).toHaveClass(
        /fr-input-group--error/,
      );
    });

    test("does not submit the form when the date is in the past", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/add-appointment/?type=RENDEZ_VOUS_DE_SUIVI`,
      );
      await waitForAllQueries(page);

      await page
        .getByTestId("title-input")
        .locator("input")
        .fill("Test Appointment");
      await page.getByTestId("date-input").locator("input").fill("2005-01-01");
      await page.getByTestId("time-input").locator("input").fill("10:00");

      await page.locator("button[type='submit']").click();

      await expect(page.getByTestId("date-input")).toHaveClass(
        /fr-input-group--error/,
      );
    });

    test("does submit the form with a correct title, date and time and redirect me to the appointment update confirmation page", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/add-appointment/?type=RENDEZ_VOUS_DE_SUIVI`,
      );
      await waitForAllQueries(page);

      await page
        .getByTestId("title-input")
        .locator("input")
        .fill("Test Appointment");
      await page.getByTestId("date-input").locator("input").fill("2225-01-01");
      await page.getByTestId("time-input").locator("input").fill("10:00");

      await page.locator("button[type='submit']").click();

      const createAppointmentMutationPromise = waitGraphQL(
        page,
        "createAppointmentForAddAppointmentPage",
      );

      await page.locator("#send-email-to-candidate-modal-button").click();

      await createAppointmentMutationPromise;

      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}/update-confirmation/`,
      );
    });

    test("does submit the form with a correct title, date, and all other infos and redirect me to the appointment update confirmation page", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/add-appointment/?type=RENDEZ_VOUS_DE_SUIVI`,
      );
      await waitForAllQueries(page);

      await page.getByTestId("title-input").locator("input").clear();
      await page
        .getByTestId("title-input")
        .locator("input")
        .fill("Test Appointment");
      await page.getByTestId("date-input").locator("input").fill("2225-01-01");
      await page.getByTestId("time-input").locator("input").fill("10:00");
      await page
        .getByTestId("duration-input")
        .locator("select")
        .selectOption("ONE_HOUR");
      await page
        .getByTestId("location-input")
        .locator("input")
        .fill("Test Location");
      await page
        .getByTestId("description-input")
        .locator("textarea")
        .fill("Test Description");

      await page.locator("button[type='submit']").click();

      const createAppointmentMutationPromise = waitGraphQL(
        page,
        "createAppointmentForAddAppointmentPage",
      );

      await page.locator("#send-email-to-candidate-modal-button").click();

      await createAppointmentMutationPromise;

      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}/update-confirmation/`,
      );
    });
  });
});
