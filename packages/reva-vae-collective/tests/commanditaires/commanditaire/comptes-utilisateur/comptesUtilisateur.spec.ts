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
                  id: "115c2693-b625-491b-8b91-c7b3875d86a0",
                  sousComptes: {
                    rows: [],
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

    await page.goto(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/comptes-utilisateur",
    );

    await expect(page).toHaveURL(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/comptes-utilisateur/aucun-compte-utilisateur",
    );
  });
});

test.describe("Commanditaire with at least one sous compte", () => {
  test.use({
    mswHandlers: [
      [
        fvae.query(
          "commanditaireVaeCollectiveForComptesUtilisateurPage",
          () => {
            return HttpResponse.json({
              data: {
                vaeCollective_getCommanditaireVaeCollective: {
                  id: "115c2693-b625-491b-8b91-c7b3875d86a0",
                  sousComptes: {
                    rows: [{ id: "dd419130-551f-40ca-9b49-730eeb95ed2d" }],
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

  test("it should display the comptes-utilisateur page", async ({ page }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/comptes-utilisateur",
    );

    await expect(
      page.getByRole("heading", { name: "Gestion des comptes" }),
    ).toBeVisible();
  });
});
