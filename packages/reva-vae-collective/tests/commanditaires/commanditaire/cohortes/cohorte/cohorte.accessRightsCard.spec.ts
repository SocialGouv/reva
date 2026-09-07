import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../../shared/utils/mockActiveFeatures";
import { mockQueryGetUserPermissions } from "../../../../shared/utils/mockGetUserPermissions";
const fvae = graphql.link("https://reva-api/api/graphql");

const mockGetCohorteByIdForCohortePage = () =>
  fvae.query("getCohorteByIdForCohortePage", () => {
    return HttpResponse.json({
      data: {
        vaeCollective_getCohorteVaeCollectiveById: {
          id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
          nom: "macohorte",
          status: "BROUILLON",
          certificationCohorteVaeCollectives: [],
        },
      },
    });
  });

test.describe("access rights card", () => {
  test.describe("when the user has the MODIFIER_DROITS_ACCES_COHORTE permission", () => {
    test.use({
      mswHandlers: [
        [
          mockGetCohorteByIdForCohortePage(),
          mockQueryActiveFeatures(),
          mockQueryGetUserPermissions(["MODIFIER_DROITS_ACCES_COHORTE"]),
        ],
        { scope: "test" },
      ],
    });

    test("when i access the page, the access rights card should be displayed", async ({
      page,
    }) => {
      await login({ page, role: "gestionnaireVaeCollective" });

      await page.goto(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
      );

      await expect(page.getByTestId("access-rights-card")).toBeVisible();
    });

    test("when i click on the access rights card's Modifier button, i should be redirected to the droits-acces page", async ({
      page,
    }) => {
      await login({ page, role: "gestionnaireVaeCollective" });

      await page.goto(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
      );

      await page
        .getByTestId("access-rights-card")
        .getByRole("link", { name: "Modifier" })
        .click();

      await expect(page).toHaveURL(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/droits-acces",
      );
    });
  });

  test.describe("when the user lacks the MODIFIER_DROITS_ACCES_COHORTE permission", () => {
    test.use({
      mswHandlers: [
        [
          mockGetCohorteByIdForCohortePage(),
          mockQueryActiveFeatures(),
          mockQueryGetUserPermissions(),
        ],
        { scope: "test" },
      ],
    });

    test("when i access the page, the access rights card should not be displayed", async ({
      page,
    }) => {
      await login({ page, role: "gestionnaireVaeCollective" });

      await page.goto(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
      );

      await expect(page.getByTestId("access-rights-card")).toHaveCount(0);
    });
  });
});
