import {
  test,
  expect,
  graphql,
  HttpResponse,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/utils/auth/login";
const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("global page behavior", () => {
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

  test("it should render the cohorte detail page", async ({ page }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
    );

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "macohorte",
    );
  });

  test("it should go back to the cohortes list page when i click on the back button", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
    );

    await page.getByRole("link", { name: "Retour" }).click();

    await expect(page).toHaveURL(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes",
    );
  });

  test("it should lead me to the edit cohorte name page when i click on the edit cohorte name button", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
    );

    await page.getByRole("link", { name: "Modifier l’intitulé" }).click();

    await expect(page).toHaveURL(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/modifier-intitule",
    );
  });
});

test.describe("delete cohorte button", () => {
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
        ],
        { scope: "test" },
      ],
    });

    test("the delete button should be disabled", async ({ page }) => {
      await login({ page, role: "gestionnaireVaeCollective" });

      await page.goto(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
      );

      await expect(
        page.getByRole("button", { name: "Supprimer cette cohorte" }),
      ).toBeDisabled();
    });
  });

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
          fvae.mutation("deleteCohorte", () => {
            return HttpResponse.json({
              data: {
                vaeCollective_deleteCohorte: null,
              },
            });
          }),
        ],
        { scope: "test" },
      ],
    });

    test("the delete button should be enabled", async ({ page }) => {
      await login({ page, role: "gestionnaireVaeCollective" });

      await page.goto(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
      );

      await expect(
        page.getByRole("button", { name: "Supprimer cette cohorte" }),
      ).toBeEnabled();
    });

    test("when i click on the delete button, a confirmation modal should be displayed", async ({
      page,
    }) => {
      await login({ page, role: "gestionnaireVaeCollective" });

      await page.goto(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
      );
      await page
        .getByRole("button", { name: "Supprimer cette cohorte" })
        .click();
      await expect(
        page.getByRole("heading", {
          name: "La suppression d’une cohorte est irreversible.",
        }),
      ).toBeVisible();
    });
  });
});

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
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications/0eda2cbf-78ae-47af-9f28-34d05f972712",
        );
      });
    });
  });
});

test.describe("organism card", () => {
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
          ],
          { scope: "test" },
        ],
      });
      test("when i access the page, the empty organism card should be disabled and display the correct text", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
        );

        await expect(
          await page.getByTestId("empty-organism-card").locator("button"),
        ).toBeDisabled();

        await expect(
          await page.getByTestId("empty-organism-card"),
        ).toContainText(
          "Liste accessible une fois la certification sélectionnée.",
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
                    certificationCohorteVaeCollectives: [],
                  },
                },
              });
            }),
          ],
          { scope: "test" },
        ],
      });
      test("when i access the page, the empty organism card should be disabled and display the correct text", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
        );

        await expect(
          await page.getByTestId("empty-organism-card").locator("button"),
        ).toBeDisabled();

        await expect(
          await page.getByTestId("empty-organism-card"),
        ).toContainText(
          "Liste accessible une fois la certification sélectionnée.",
        );
      });
    });
  });

  test.describe("when the certification is set", () => {
    test.describe("when the organism is not set", () => {
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
                          certificationCohorteVaeCollectiveOnOrganisms: [],
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

        test("when i access the page, the empty organism card should be displayed", async ({
          page,
        }) => {
          await login({ page, role: "gestionnaireVaeCollective" });

          await page.goto(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
          );
          await expect(page.getByTestId("empty-organism-card")).toBeVisible();
        });

        test("when i click on the empty organism card, i should be redirected to the select organism page", async ({
          page,
        }) => {
          await login({ page, role: "gestionnaireVaeCollective" });

          await page.goto(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
          );

          await page.getByTestId("empty-organism-card").click();

          await expect(page).toHaveURL(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/aaps",
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
            ],
            { scope: "test" },
          ],
        });

        test("when i access the page, the empty organism card should be disabled and display the correct text", async ({
          page,
        }) => {
          await login({ page, role: "gestionnaireVaeCollective" });

          await page.goto(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
          );

          await expect(
            await page.getByTestId("empty-organism-card").locator("button"),
          ).toBeDisabled();

          await expect(
            await page.getByTestId("empty-organism-card"),
          ).toContainText(
            "Choisir un AAP qui sera en charge de cette cohorte.",
          );
        });
      });
    });

    test.describe("when the organism is set", () => {
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
                          certificationCohorteVaeCollectiveOnOrganisms: [
                            {
                              id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
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
                          ],
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

        test("when i access the page, the filled organism card should be displayed", async ({
          page,
        }) => {
          await login({ page, role: "gestionnaireVaeCollective" });

          await page.goto(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
          );
          await expect(page.getByTestId("filled-organism-card")).toBeVisible();
        });

        test("when i click on the filled organism card, i should be redirected to the select organism page", async ({
          page,
        }) => {
          await login({ page, role: "gestionnaireVaeCollective" });

          await page.goto(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
          );

          await page.getByTestId("filled-organism-card").click();

          await expect(page).toHaveURL(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/aaps",
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
                          certificationCohorteVaeCollectiveOnOrganisms: [
                            {
                              id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
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
                          ],
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

        test("when i access the page, the filled organism card should be disabled", async ({
          page,
        }) => {
          await login({ page, role: "gestionnaireVaeCollective" });

          await page.goto(
            "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
          );

          await expect(
            await page.getByTestId("filled-organism-card").locator("button"),
          ).toBeDisabled();
        });
      });
    });
  });
});
