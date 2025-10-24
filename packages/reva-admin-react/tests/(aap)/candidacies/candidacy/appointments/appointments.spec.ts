import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("appointments page", () => {
  const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

  const candidacyAndUpcomingAppointmentsHandler = fvae.query(
    "getCandidacyAndUpcomingAppointmentsForAppointmentsPage",
    graphQLResolver({
      getCandidacyById: {
        id: "fb451fbc-3218-416d-9ac9-65b13432469f",
        appointments: {
          rows: [],
          info: {
            totalRows: 0,
            currentPage: 1,
            totalPages: 1,
          },
        },
      },
    }),
  );

  const candidacyAndPastAppointmentsHandler = fvae.query(
    "getCandidacyAndPastAppointmentsForAppointmentsPage",
    graphQLResolver({
      getCandidacyById: {
        id: "fb451fbc-3218-416d-9ac9-65b13432469f",
        appointments: {
          rows: [],
          info: {
            totalRows: 0,
            currentPage: 1,
            totalPages: 1,
          },
        },
      },
    }),
  );

  const rendezVousPedagogiqueForAppointmentsPageHandler = fvae.query(
    "getRendezVousPedagogiqueForAppointmentsPage",
    graphQLResolver({
      getCandidacyById: {
        id: "fb451fbc-3218-416d-9ac9-65b13432469f",
        appointments: {
          rows: [],
          info: {
            totalRows: 0,
            currentPage: 1,
            totalPages: 1,
          },
        },
      },
    }),
  );

  test.use({
    mswHandlers: [
      [
        ...aapCommonHandlers,
        candidacyAndUpcomingAppointmentsHandler,
        candidacyAndPastAppointmentsHandler,
        rendezVousPedagogiqueForAppointmentsPageHandler,
      ],
      { scope: "test" },
    ],
  });
  test("shows appointments page title", async ({ page }) => {
    await login({ role: "aap", page });
    await page.goto(
      "/admin2/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/",
    );
    await aapCommonWait(page);

    await expect(
      page.getByTestId("appointments-page").getByRole("heading", { level: 1 }),
    ).toHaveText("Gestion des rendez-vous");
  });
});
