import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../../shared/utils/mockActiveFeatures";
const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("registration code and url display", () => {
  test.describe("when the cohorte status is 'BROUILLON'", () => {
    test.use({
      mswHandlers: [
        [
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
          }),
          mockQueryActiveFeatures(),
        ],
        { scope: "test" },
      ],
    });
    test("the registration code and url display should not be displayed", async ({
      page,
    }) => {
      await login({ page, role: "gestionnaireVaeCollective" });

      await page.goto(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
      );

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "macohorte",
      );

      await expect(page.getByTestId("registration-code-display")).toBeHidden();
      await expect(page.getByTestId("registration-url-display")).toBeHidden();
    });
  });
  test.describe("when the cohorte status is 'PUBLIE'", () => {
    test.use({
      mswHandlers: [
        [
          fvae.query("getCohorteByIdForCohortePage", () => {
            return HttpResponse.json({
              data: {
                vaeCollective_getCohorteVaeCollectiveById: {
                  id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
                  nom: "macohorte",
                  status: "PUBLIE",
                  codeInscription: "CODE1234",
                  certificationCohorteVaeCollectives: [],
                },
              },
            });
          }),
          mockQueryActiveFeatures(),
        ],
        { scope: "test" },
      ],
    });
    test("the registration code and url display should be displayed", async ({
      page,
    }) => {
      await login({ page, role: "gestionnaireVaeCollective" });

      await page.goto(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
      );

      await expect(page.getByTestId("registration-code-display")).toContainText(
        "CODE1234",
      );
      await expect(page.getByTestId("registration-url-display")).toContainText(
        "http://localhost:3002/inscription-candidat/vae-collective?codeInscription=CODE1234",
      );
    });
  });
});
