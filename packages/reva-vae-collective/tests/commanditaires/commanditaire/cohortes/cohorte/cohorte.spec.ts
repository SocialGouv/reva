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
