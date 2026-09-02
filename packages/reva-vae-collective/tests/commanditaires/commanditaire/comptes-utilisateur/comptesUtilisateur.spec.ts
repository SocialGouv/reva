import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../shared/utils/mockActiveFeatures";
import { mockQueryGetUserPermissions } from "../../../shared/utils/mockGetUserPermissions";

const fvae = graphql.link("https://reva-api/api/graphql");

const commanditaireId = "115c2693-b625-491b-8b91-c7b3875d86a0";
const pageUrl = `/vae-collective/commanditaires/${commanditaireId}/comptes-utilisateur`;

test.describe("Commanditaire with no sous compte", () => {
  test.use({
    mswHandlers: [
      [
        fvae.query(
          "commanditaireVaeCollectiveForComptesUtilisateurPage",
          () => {
            return HttpResponse.json({
              data: {
                vaeCollective_getCommanditaireVaeCollective: {
                  id: commanditaireId,
                  sousComptes: {
                    rows: [],
                    info: { totalRows: 0 },
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

  test("it should redirect to the aucun-compte-utilisateur page", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await expect(page).toHaveURL(`${pageUrl}/aucun-compte-utilisateur`);
  });
});

test.describe("Commanditaire with multiple sous comptes", () => {
  test.use({
    mswHandlers: [
      [
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
                        id: "dd419130-551f-40ca-9b49-730eeb95ed2d",
                        canCreateCohorteVaeCollective: true,
                        account: { firstname: "Jean", lastname: "Dupont" },
                      },
                      {
                        id: "4f1c2693-b625-491b-8b91-c7b3875d86b1",
                        canCreateCohorteVaeCollective: false,
                        account: { firstname: "Marie", lastname: "Curie" },
                      },
                    ],
                    info: { totalRows: 2 },
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

  test("it should display the sous comptes list", async ({ page }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await expect(
      page.getByRole("heading", { name: "Gestion des comptes" }),
    ).toBeVisible();

    await expect(page.getByRole("link", { name: "Dupont Jean" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Curie Marie" })).toBeVisible();
  });

  test("it should lead me to the compte utilisateur details page when i click on a sous compte", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await page.getByRole("link", { name: "Dupont Jean" }).click();

    await expect(page).toHaveURL(
      `${pageUrl}/dd419130-551f-40ca-9b49-730eeb95ed2d`,
    );
  });

  test("it should display the create cohorte tag only for sous comptes allowed to create a cohorte", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    const jeanCard = page.locator(".fr-card", { hasText: "Dupont Jean" });
    const marieCard = page.locator(".fr-card", { hasText: "Curie Marie" });

    await expect(
      jeanCard.getByText("Création de cohorte activée"),
    ).toBeVisible();
    await expect(
      marieCard.getByText("Création de cohorte activée"),
    ).not.toBeVisible();
  });

  test("it should lead me to the new compte utilisateur page when i click on the add collaborateur button", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await page.getByRole("link", { name: "Ajouter un collaborateur" }).click();

    await expect(page).toHaveURL(`${pageUrl}/nouveau-compte-utilisateur`);
  });
});

test.describe("Commanditaire with more than one page of sous comptes", () => {
  const firstPageRows = Array.from({ length: 10 }, (_, i) => ({
    id: `sous-compte-page1-${i}`,
    canCreateCohorteVaeCollective: false,
    account: { firstname: "Jean", lastname: `Dupont${i}` },
  }));
  const secondPageRows = [
    {
      id: "sous-compte-page2-0",
      canCreateCohorteVaeCollective: false,
      account: { firstname: "Marie", lastname: "Curie" },
    },
  ];

  test.use({
    mswHandlers: [
      [
        fvae.query(
          "commanditaireVaeCollectiveForComptesUtilisateurPage",
          ({ variables }) => {
            const rows =
              variables.offset === 0 ? firstPageRows : secondPageRows;
            return HttpResponse.json({
              data: {
                vaeCollective_getCommanditaireVaeCollective: {
                  id: commanditaireId,
                  sousComptes: {
                    rows,
                    info: { totalRows: 11 },
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

  test("it should display only the first 10 sous comptes and navigate to the next page", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(pageUrl);

    await expect(
      page.getByRole("link", { name: "Dupont0 Jean" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Curie Marie" }),
    ).not.toBeVisible();

    await page.getByRole("link", { name: "2", exact: true }).click();

    await expect(page).toHaveURL(`${pageUrl}?page=2`);
    await expect(page.getByRole("link", { name: "Curie Marie" })).toBeVisible();
  });
});
