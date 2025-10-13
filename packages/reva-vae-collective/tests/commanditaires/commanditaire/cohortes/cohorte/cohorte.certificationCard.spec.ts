import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../../shared/utils/mockActiveFeatures";
const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("certification card", () => {
  test.describe("when the certification is not set", () => {
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

      test("when i access the page, the empty certification card should be displayed", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
        );
        await expect(
          page.getByTestId("empty-certification-card"),
        ).toBeVisible();
      });

      test("when i click on the empty certification card, i should be redirected to the select certification page", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
        );

        await page.getByTestId("empty-certification-card").click();

        await expect(page).toHaveURL(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications",
        );
      });
    });
  });

  test.describe("when the certification is set", () => {
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
                    certificationCohorteVaeCollectives: [
                      {
                        id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
                        certification: {
                          id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
                          certification: {
                            label: "Certification 1",
                            codeRncp: "123456",
                          },
                        },
                      },
                    ],
                  },
                },
              });
            }),
            mockQueryActiveFeatures(),
          ],
          { scope: "test" },
        ],
      });

      test("when i access the page, the filled certification card should be displayed", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
        );
        await expect(
          page.getByTestId("filled-certification-card"),
        ).toBeVisible();
      });

      test("when i click on the filled certification card, i should be redirected to the select certification page", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
        );

        await page.getByTestId("filled-certification-card").click();

        await expect(page).toHaveURL(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications",
        );
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
                    certificationCohorteVaeCollectives: [
                      {
                        id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
                        certification: {
                          id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
                          certification: {
                            label: "Certification 1",
                            codeRncp: "123456",
                          },
                        },
                      },
                    ],
                  },
                },
              });
            }),
            mockQueryActiveFeatures(),
          ],
          { scope: "test" },
        ],
      });

      test("when i click on the filled certification card, i should be redirected to the certification details page", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
        );

        await page.getByTestId("filled-certification-card").click();

        await expect(page).toHaveURL(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications/0eda2cbf-78ae-47af-9f28-34d05f972712?certificationSelectionDisabled=true",
        );
      });
    });
  });
});
