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

const mockCommanditaireVaeCollectiveForCohortesPage = () =>
  fvae.query("commanditaireVaeCollectiveForCohortesPage", () => {
    return HttpResponse.json({
      data: {
        vaeCollective_getCommanditaireVaeCollective: {
          id: "115c2693-b625-491b-8b91-c7b3875d86a0",
          raisonSociale: "moncommanditaire",
          cohorteVaeCollectives: {
            rows: [
              {
                id: "dd419130-551f-40ca-9b49-730eeb95ed2d",
                nom: "maCohorte",
                status: "BROUILLON",
                createdAt: 1752593034738,
                organism: null,
              },
            ],
            info: {
              totalRows: 1,
            },
          },
        },
      },
    });
  });

test.describe("Pilotage navigation tab", () => {
  test.describe("when the user has the VOIR_STATISTIQUES permission", () => {
    test.use({
      mswHandlers: [
        [
          mockCommanditaireVaeCollectiveForCohortesPage(),
          mockQueryActiveFeatures(["SHOW_METABASE_DASHBOARD_VAE_COLLECTIVE"]),
          mockQueryGetUserPermissions(["VOIR_STATISTIQUES"]),
        ],
        { scope: "test" },
      ],
    });

    test("the Pilotage tab should be visible", async ({ page }) => {
      await login({ page, role: "gestionnaireVaeCollective" });

      await page.goto(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes",
      );

      await expect(page.getByRole("link", { name: "Pilotage" })).toBeVisible();
    });
  });

  test.describe("when the user lacks the VOIR_STATISTIQUES permission", () => {
    test.use({
      mswHandlers: [
        [
          mockCommanditaireVaeCollectiveForCohortesPage(),
          mockQueryActiveFeatures(["SHOW_METABASE_DASHBOARD_VAE_COLLECTIVE"]),
          mockQueryGetUserPermissions(),
        ],
        { scope: "test" },
      ],
    });

    test("the Pilotage tab should not be displayed", async ({ page }) => {
      await login({ page, role: "gestionnaireVaeCollective" });

      await page.goto(
        "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes",
      );

      await expect(
        page.getByRole("button", { name: "Se déconnecter" }),
      ).toBeVisible();

      await expect(page.getByRole("link", { name: "Pilotage" })).toHaveCount(0);
    });
  });
});

test.describe("Gestion des comptes navigation tab", () => {
  test.describe("when the VAE_COLLECTIVE_ACCOUNTS feature flag is active", () => {
    test.describe("and the user has the CREER_SOUS_COMPTE permission", () => {
      test.use({
        mswHandlers: [
          [
            mockCommanditaireVaeCollectiveForCohortesPage(),
            mockQueryActiveFeatures(["VAE_COLLECTIVE_ACCOUNTS"]),
            mockQueryGetUserPermissions(["CREER_SOUS_COMPTE"]),
          ],
          { scope: "test" },
        ],
      });

      test("the Gestion des comptes tab should be visible", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes",
        );

        await expect(
          page.getByRole("link", { name: "Gestion des comptes" }),
        ).toBeVisible();
      });
    });

    test.describe("and the user only has the SUPPRIMER_SOUS_COMPTE permission", () => {
      test.use({
        mswHandlers: [
          [
            mockCommanditaireVaeCollectiveForCohortesPage(),
            mockQueryActiveFeatures(["VAE_COLLECTIVE_ACCOUNTS"]),
            mockQueryGetUserPermissions(["SUPPRIMER_SOUS_COMPTE"]),
          ],
          { scope: "test" },
        ],
      });

      test("the Gestion des comptes tab should be visible", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes",
        );

        await expect(
          page.getByRole("link", { name: "Gestion des comptes" }),
        ).toBeVisible();
      });
    });

    test.describe("and the user lacks all accounts permissions", () => {
      test.use({
        mswHandlers: [
          [
            mockCommanditaireVaeCollectiveForCohortesPage(),
            mockQueryActiveFeatures(["VAE_COLLECTIVE_ACCOUNTS"]),
            mockQueryGetUserPermissions(),
          ],
          { scope: "test" },
        ],
      });

      test("the Gestion des comptes tab should not be displayed", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes",
        );

        await expect(
          page.getByRole("button", { name: "Se déconnecter" }),
        ).toBeVisible();

        await expect(
          page.getByRole("link", { name: "Gestion des comptes" }),
        ).toHaveCount(0);
      });
    });
  });

  test.describe("when the VAE_COLLECTIVE_ACCOUNTS feature flag is inactive", () => {
    test.describe("even though the user has all accounts permissions", () => {
      test.use({
        mswHandlers: [
          [
            mockCommanditaireVaeCollectiveForCohortesPage(),
            mockQueryActiveFeatures(),
            mockQueryGetUserPermissions([
              "CREER_SOUS_COMPTE",
              "MODIFIER_SOUS_COMPTE",
              "SUPPRIMER_SOUS_COMPTE",
            ]),
          ],
          { scope: "test" },
        ],
      });

      test("the Gestion des comptes tab should not be displayed", async ({
        page,
      }) => {
        await login({ page, role: "gestionnaireVaeCollective" });

        await page.goto(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes",
        );

        await expect(
          page.getByRole("button", { name: "Se déconnecter" }),
        ).toBeVisible();

        await expect(
          page.getByRole("link", { name: "Gestion des comptes" }),
        ).toHaveCount(0);
      });
    });
  });
});
