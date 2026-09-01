import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../../shared/utils/mockActiveFeatures";
const fvae = graphql.link("https://reva-api/api/graphql");

const commanditaireId = "115c2693-b625-491b-8b91-c7b3875d86a0";
const sousCompteId = "dd419130-551f-40ca-9b49-730eeb95ed2d";

test.use({
  mswHandlers: [
    [
      fvae.mutation("createSousCompteVaeCollective", () => {
        return HttpResponse.json({
          data: {
            vaeCollective_createSousCompteVaeCollective: {
              id: sousCompteId,
            },
          },
        });
      }),
      mockQueryActiveFeatures(),
    ],
    { scope: "test" },
  ],
});

const goToPage = async (page: import("@playwright/test").Page) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur/nouveau-compte-utilisateur`,
  );
};

test("it should let me create a new compte utilisateur with only the required fields filled", async ({
  page,
}) => {
  await goToPage(page);

  await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Dupont");
  await page
    .getByRole("textbox", { name: "Adresse électronique de connexion" })
    .fill("dupont@example.com");

  await page.getByRole("button", { name: "Ajouter" }).click();

  await expect(page).toHaveURL(
    `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur/${sousCompteId}`,
  );
});

test("it should create a compte utilisateur without the cohorte creation permission by default", async ({
  page,
  msw,
}) => {
  let receivedVariables: Record<string, unknown> | undefined;
  msw.use(
    fvae.mutation("createSousCompteVaeCollective", ({ variables }) => {
      receivedVariables = variables;
      return HttpResponse.json({
        data: {
          vaeCollective_createSousCompteVaeCollective: {
            id: sousCompteId,
          },
        },
      });
    }),
  );

  await goToPage(page);

  await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Dupont");
  await page
    .getByRole("textbox", { name: "Adresse électronique de connexion" })
    .fill("dupont@example.com");

  await page.getByRole("button", { name: "Ajouter" }).click();

  await expect(page).toHaveURL(
    `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur/${sousCompteId}`,
  );

  expect(receivedVariables?.canCreateCohorteVaeCollective).toBe(false);
});

test("it should let me create a compte utilisateur with the cohorte creation permission enabled", async ({
  page,
  msw,
}) => {
  let receivedVariables: Record<string, unknown> | undefined;
  msw.use(
    fvae.mutation("createSousCompteVaeCollective", ({ variables }) => {
      receivedVariables = variables;
      return HttpResponse.json({
        data: {
          vaeCollective_createSousCompteVaeCollective: {
            id: sousCompteId,
          },
        },
      });
    }),
  );

  await goToPage(page);

  await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Dupont");
  await page
    .getByRole("textbox", { name: "Adresse électronique de connexion" })
    .fill("dupont@example.com");
  await page
    .getByRole("checkbox", {
      name: "Activer la création de cohorte par ce collaborateur",
    })
    .check();

  await page.getByRole("button", { name: "Ajouter" }).click();

  await expect(page).toHaveURL(
    `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur/${sousCompteId}`,
  );

  expect(receivedVariables?.canCreateCohorteVaeCollective).toBe(true);
});

test("it should let me create a new compte utilisateur with the optional firstname filled", async ({
  page,
}) => {
  await goToPage(page);

  await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Dupont");
  await page.getByRole("textbox", { name: "Prénom (Optionnel)" }).fill("Jean");
  await page
    .getByRole("textbox", { name: "Adresse électronique de connexion" })
    .fill("dupont@example.com");

  await page.getByRole("button", { name: "Ajouter" }).click();

  await expect(page).toHaveURL(
    `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur/${sousCompteId}`,
  );
});

test("it should not let me create a new compte utilisateur when the lastname is empty", async ({
  page,
}) => {
  await goToPage(page);

  await page
    .getByRole("textbox", { name: "Adresse électronique de connexion" })
    .fill("dupont@example.com");

  await page.getByRole("button", { name: "Ajouter" }).click();

  await expect(page.getByTestId("account-lastname-input")).toContainText(
    "Merci de remplir ce champ",
  );

  await expect(page).toHaveURL(
    `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur/nouveau-compte-utilisateur`,
  );
});

test("it should not let me create a new compte utilisateur when the lastname is less than 3 characters", async ({
  page,
}) => {
  await goToPage(page);

  await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Du");
  await page
    .getByRole("textbox", { name: "Adresse électronique de connexion" })
    .fill("dupont@example.com");

  await page.getByRole("button", { name: "Ajouter" }).click();

  await expect(page.getByTestId("account-lastname-input")).toContainText(
    "Ce champ doit contenir au moins 3 caractères",
  );

  await expect(page).toHaveURL(
    `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur/nouveau-compte-utilisateur`,
  );
});

test("it should not let me create a new compte utilisateur when the email is empty", async ({
  page,
}) => {
  await goToPage(page);

  await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Dupont");

  await page.getByRole("button", { name: "Ajouter" }).click();

  await expect(page.getByTestId("account-email-input")).toContainText(
    "Merci de remplir ce champ",
  );

  await expect(page).toHaveURL(
    `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur/nouveau-compte-utilisateur`,
  );
});

test("it should let me cancel and go back to the comptes-utilisateur page", async ({
  page,
}) => {
  await goToPage(page);

  await page.getByRole("link", { name: "Annuler" }).click();

  await expect(page).toHaveURL(
    `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur`,
  );
});
