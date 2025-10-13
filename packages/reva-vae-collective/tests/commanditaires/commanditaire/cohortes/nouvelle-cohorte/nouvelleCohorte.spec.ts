import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../../shared/utils/mockActiveFeatures";
const fvae = graphql.link("https://reva-api/api/graphql");

test.use({
  mswHandlers: [
    [
      fvae.mutation("createCohorteVaeCollective", () => {
        return HttpResponse.json({
          data: {
            vaeCollective_createCohorteVaeCollective: {
              id: "115c2693-b625-491b-8b91-c7b3875d86a0",
            },
          },
        });
      }),
      mockQueryActiveFeatures(),
    ],
    { scope: "test" },
  ],
});

test("it shoule let me create a new cohorte when the cohorte name is 5 characters long", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/nouvelle-cohorte",
  );

  await page
    .getByRole("textbox", { name: "Nom de la cohorte" })
    .fill("maCohorte");

  await page.getByRole("button", { name: "Créer" }).click();

  await expect(page).toHaveURL(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/115c2693-b625-491b-8b91-c7b3875d86a0",
  );
});

test("it shoule not let me create a new cohorte when the cohorte name is empty", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/nouvelle-cohorte",
  );

  await page.getByRole("button", { name: "Créer" }).click();

  await expect(page.getByTestId("cohort-name-input")).toContainText(
    "Merci de remplir ce champ",
  );

  await expect(page).toHaveURL(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/nouvelle-cohorte",
  );
});

test("it shoule not let me create a new cohorte when the cohorte name is less than 5 characters", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/nouvelle-cohorte",
  );

  await page.getByRole("textbox", { name: "Nom de la cohorte" }).fill("coho");

  await page.getByRole("button", { name: "Créer" }).click();

  await expect(page.getByTestId("cohort-name-input")).toContainText(
    "Ce champ doit contenir au moins 5 caractères",
  );

  await expect(page).toHaveURL(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/nouvelle-cohorte",
  );
});
