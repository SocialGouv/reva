import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../../shared/utils/mockActiveFeatures";
const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("generate cohorte code inscription button", () => {
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

    test("the generate cohorte code inscription button should not be displayed", async ({
      page,
    }) => {
      await login({ page, role: "gestionnaireVaeCollective" });

      await page.goto(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
      );

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "macohorte",
      );

      await expect(
        page.getByRole("button", {
          name: "Générez un lien et un code d’accès à la cohorte",
        }),
      ).toBeHidden();
    });
  });

  test.describe("when the cohorte status is 'BROUILLON'", () => {
    test.describe("when the certification is not set", () => {
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
          ],
          { scope: "test" },
        ],
      });

      test("the generate cohorte code inscription button should be disabled", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
        );

        await expect(
          page.getByRole("button", {
            name: "Générez un lien et un code d’accès à la cohorte",
          }),
        ).toBeDisabled();
      });
    });

    test.describe("when the certification is set", () => {
      test.describe("when the organism is not set", () => {
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
            ],
            { scope: "test" },
          ],
        });

        test("the generate cohorte code inscription button should be disabled", async ({
          page,
        }) => {
          await login({ page, role: "gestionnaireVaeCollective" });

          await page.goto(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
          );

          await expect(
            page.getByRole("button", {
              name: "Générez un lien et un code d’accès à la cohorte",
            }),
          ).toBeDisabled();
        });
      });

      test.describe("when the organism is set", () => {
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
                      organism: {
                        id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
                        label: "Organism 1",
                        adresseNumeroEtNomDeRue: "123456",
                        adresseCodePostal: "123456",
                        adresseVille: "123456",
                        emailContact: "123456",
                        telephone: "123456",
                      },
                    },
                  },
                });
              }),
              fvae.mutation("publishCohorteVAECollective", () => {
                return HttpResponse.json({
                  data: {
                    vaeCollective_publishCohorteVAECollective: {
                      id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
                    },
                  },
                });
              }),
            ],
            { scope: "test" },
          ],
        });

        test("the generate cohorte code inscription button should be enabled", async ({
          page,
        }) => {
          await login({ page, role: "gestionnaireVaeCollective" });

          await page.goto(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
          );

          await expect(
            page.getByRole("button", {
              name: "Générez un lien et un code d’accès à la cohorte",
            }),
          ).toBeEnabled();
        });

        test("when i click on the generate cohorte code inscription button, a confirmation modal should be displayed", async ({
          page,
        }) => {
          await login({ page, role: "gestionnaireVaeCollective" });

          await page.goto(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
          );
          await page
            .getByRole("button", {
              name: "Générez un lien et un code d’accès à la cohorte",
            })
            .click();
          await expect(
            page.getByRole("heading", {
              name: "La génération du code est irréversible.",
            }),
          ).toBeVisible();
        });

        test("when i confirm the modal, it should close", async ({ page }) => {
          await login({ page, role: "gestionnaireVaeCollective" });

          await page.goto(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
          );
          await page
            .getByRole("button", {
              name: "Générez un lien et un code d’accès à la cohorte",
            })
            .click();

          await expect(
            page.getByRole("heading", {
              name: "La génération du code est irréversible.",
            }),
          ).toBeVisible();

          await page.getByRole("button", { name: "Générer" }).click();

          await expect(
            page.getByRole("heading", {
              name: "La génération du code est irréversible.",
            }),
          ).not.toBeVisible();

          await expect(page).toHaveURL(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
          );
        });
      });
    });
  });
});

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
