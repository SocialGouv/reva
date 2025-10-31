import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";
const APPOINTMENT_ID = "5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3";

test.describe("when I access the delete appointment confirmation page", () => {
  test.use({
    mswHandlers: [[...aapCommonHandlers], { scope: "test" }],
  });

  test("show the correct title and content", async ({ page }) => {
    await login({ role: "aap", page });
    await page.goto(
      `/admin2/candidacies/${CANDIDACY_ID}/appointments/${APPOINTMENT_ID}/delete-confirmation/?date=2025-01-01T09:00:00.000Z&candidateFirstName=John&candidateLastName=Doe`,
    );
    await aapCommonWait(page);

    await expect(
      page.getByTestId("appointment-delete-confirmation-page-title"),
    ).toHaveText("Rendez-vous supprimé");
    await expect(
      page.getByTestId("appointment-delete-confirmation-page-date"),
    ).toHaveText("Le 01/01/2025 à 10:00");
    await expect(
      page.getByTestId("appointment-delete-confirmation-page-candidate"),
    ).toHaveText("Candidat : Doe John");
  });
});
