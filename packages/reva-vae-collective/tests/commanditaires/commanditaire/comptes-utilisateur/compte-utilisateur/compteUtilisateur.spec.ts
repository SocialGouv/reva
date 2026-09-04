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

const commanditaireId = "115c2693-b625-491b-8b91-c7b3875d86a0";
const sousCompteVaeCollectiveId = "dd419130-551f-40ca-9b49-730eeb95ed2d";
const pageUrl = `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur/${sousCompteVaeCollectiveId}`;
const listPageUrl = `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur`;

const mockGetSousCompteVaeCollective = ({
  canCreateCohorteVaeCollective,
}: {
  canCreateCohorteVaeCollective: boolean;
}) =>
  fvae.query("getSousCompteVaeCollective", () => {
    return HttpResponse.json({
      data: {
        vaeCollective_getSousCompteVaeCollective: {
          id: sousCompteVaeCollectiveId,
          canCreateCohorteVaeCollective,
          account: {
            firstname: "Jean",
            lastname: "Dupont",
            email: "jean.dupont@example.com",
          },
        },
      },
    });
  });

test.describe("Compte utilisateur allowed to create a cohorte", () => {
  test.use({
    mswHandlers: [
      [
        mockGetSousCompteVaeCollective({
          canCreateCohorteVaeCollective: true,
        }),
        mockQueryActiveFeatures(),
        mockQueryGetUserPermissions(),
      ],
      { scope: "test" },
    ],
  });

  test("it should display the sous compte's name in the heading", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await expect(
      page.getByRole("heading", { name: "Dupont Jean" }),
    ).toBeVisible();
  });

  test("it should display the sous compte's name as the current breadcrumb page", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await expect(page.locator('[aria-current="page"]')).toHaveText(
      "Dupont Jean",
    );
  });

  test("it should display the sous compte's email", async ({ page }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await expect(page.getByText("Email de connexion")).toBeVisible();
    await expect(page.getByText("jean.dupont@example.com")).toBeVisible();
  });

  test("it should display the create cohorte toggle as checked and disabled", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    const toggle = page.getByRole("checkbox", {
      name: "Activer la création de cohorte par ce collaborateur",
    });

    await expect(toggle).toBeChecked();
    await expect(toggle).toBeDisabled();
  });
});

test.describe("Back button navigation", () => {
  test.use({
    mswHandlers: [
      [
        mockGetSousCompteVaeCollective({
          canCreateCohorteVaeCollective: true,
        }),
        fvae.query(
          "commanditaireVaeCollectiveForComptesUtilisateurPage",
          () => {
            return HttpResponse.json({
              data: {
                vaeCollective_getCommanditaireVaeCollective: {
                  id: commanditaireId,
                  sousComptes: {
                    rows: [
                      {
                        id: sousCompteVaeCollectiveId,
                        canCreateCohorteVaeCollective: true,
                        account: { firstname: "Jean", lastname: "Dupont" },
                      },
                    ],
                    info: { totalRows: 1 },
                  },
                },
              },
            });
          },
        ),
        mockQueryActiveFeatures(),
        mockQueryGetUserPermissions(),
      ],
      { scope: "test" },
    ],
  });

  test("it should lead back to the comptes utilisateur list page when i click on the back button", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await page.getByRole("link", { name: "Retour" }).click();

    await expect(page).toHaveURL(listPageUrl);
  });
});

test.describe("Compte utilisateur not allowed to create a cohorte", () => {
  test.use({
    mswHandlers: [
      [
        mockGetSousCompteVaeCollective({
          canCreateCohorteVaeCollective: false,
        }),
        mockQueryActiveFeatures(),
        mockQueryGetUserPermissions(),
      ],
      { scope: "test" },
    ],
  });

  test("it should display the create cohorte toggle as unchecked", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    const toggle = page.getByRole("checkbox", {
      name: "Activer la création de cohorte par ce collaborateur",
    });

    await expect(toggle).not.toBeChecked();
  });
});
