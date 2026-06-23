import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

test.use({
  mswHandlers: [[...aapCommonHandlers], { scope: "test" }],
});

test.describe("Multiple certification authorities selection disclaimer page", () => {
  test("should display the disclaimer content", async ({ page }) => {
    await login({ role: "aap", page });
    await page.goto(
      `/admin2/candidacies/${CANDIDACY_ID}/summary/multiple-certification-authorities-selection/disclaimer/`,
    );
    await aapCommonWait(page);

    await expect(
      page.getByRole("heading", { name: "Certificateur" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Le certificateur étudiera les dossiers de faisabilité et de validation de cette candidature.",
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Plusieurs certificateurs sont disponibles pour la certification sélectionnée et la localisation du candidat. Vous devez sélectionner le certificateur le plus adapté en accord avec le candidat.",
      ),
    ).toBeVisible();
  });

  test("should lead me to the certification authorities list page when i click on the 'Liste des certificateurs' button", async ({
    page,
  }) => {
    await login({ role: "aap", page });
    await page.goto(
      `/admin2/candidacies/${CANDIDACY_ID}/summary/multiple-certification-authorities-selection/disclaimer/`,
    );
    await aapCommonWait(page);

    await page.getByRole("link", { name: "Liste des certificateurs" }).click();
    await expect(page).toHaveURL(
      `/admin2/candidacies/${CANDIDACY_ID}/summary/multiple-certification-authorities-selection/certification-authorities-list/`,
    );
  });

  test("should lead me back to the candidacy summary page when i click on the 'Retour' button", async ({
    page,
  }) => {
    await login({ role: "aap", page });
    await page.goto(
      `/admin2/candidacies/${CANDIDACY_ID}/summary/multiple-certification-authorities-selection/disclaimer/`,
    );
    await aapCommonWait(page);

    await page.getByRole("link", { name: "Retour" }).click();
    await expect(page).toHaveURL(
      `/admin2/candidacies/${CANDIDACY_ID}/summary/`,
    );
  });
});
