import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../../shared/utils/mockActiveFeatures";
import { mockQueryGetUserPermissions } from "../../../../shared/utils/mockGetUserPermissions";

const commanditaireId = "115c2693-b625-491b-8b91-c7b3875d86a0";
const pageUrl = `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur/aucun-compte-utilisateur`;

test.describe("page content", () => {
  test.use({
    mswHandlers: [
      [mockQueryActiveFeatures(), mockQueryGetUserPermissions()],
      { scope: "test" },
    ],
  });

  test("it should display the page heading, description and illustration", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await expect(
      page.getByRole("heading", { name: "Gestion des comptes" }),
    ).toBeVisible();
  });
});

test.describe("Commanditaire with CREER_SOUS_COMPTE permission", () => {
  test.use({
    mswHandlers: [
      [
        mockQueryActiveFeatures(),
        mockQueryGetUserPermissions(["CREER_SOUS_COMPTE"]),
      ],
      { scope: "test" },
    ],
  });

  test("the add collaborateur button should be enabled", async ({ page }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    const addCollaborateurLink = page.getByRole("link", {
      name: "Ajouter un collaborateur",
    });

    await expect(addCollaborateurLink).toBeEnabled();
  });

  test("it should lead me to the new compte utilisateur page when i click on the add collaborateur button", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await page.getByRole("link", { name: "Ajouter un collaborateur" }).click();

    await expect(page).toHaveURL(
      `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur/nouveau-compte-utilisateur`,
    );
  });
});

test.describe("Commanditaire without CREER_SOUS_COMPTE permission", () => {
  test.use({
    mswHandlers: [
      [mockQueryActiveFeatures(), mockQueryGetUserPermissions()],
      { scope: "test" },
    ],
  });

  test("the add collaborateur button should be disabled when the user lacks the CREER_SOUS_COMPTE permission", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await expect(
      page.getByRole("button", { name: "Ajouter un collaborateur" }),
    ).toBeDisabled();
  });
});
