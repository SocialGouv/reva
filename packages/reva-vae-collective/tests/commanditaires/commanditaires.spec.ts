import {
  expect,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../shared/utils/auth/login";
import { baseUrlTest } from "../shared/utils/getBaseUrlTest";
import { mockQueryActiveFeatures } from "../shared/utils/mockActiveFeatures";

test.describe("Commanditaires", () => {
  test.describe("Admin access", () => {
    test.describe("global page behaviour", () => {
      test.use({
        mswHandlers: [
          [
            baseUrlTest.query(
              "commanditaireVaeCollectivesForCommanditairesPage",
              () => {
                return HttpResponse.json({
                  data: {
                    vaeCollective_commanditaireVaeCollectives: {
                      rows: [],
                      info: {
                        totalRows: 0,
                        page: 1,
                        pageSize: 10,
                      },
                    },
                  },
                });
              },
            ),
            mockQueryActiveFeatures(),
          ],
          { scope: "test" },
        ],
      });

      test("it should display the commanditaire cohortes page when i access it", async ({
        page,
      }) => {
        await login({ page, role: "admin" });

        await page.goto("/vae-collective/commanditaires/");

        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          "Porteurs de projet VAE collective",
        );
      });
    });
    test.describe("Commanditaire card", () => {
      test.use({
        mswHandlers: [
          [
            baseUrlTest.query(
              "commanditaireVaeCollectivesForCommanditairesPage",
              () => {
                return HttpResponse.json({
                  data: {
                    vaeCollective_commanditaireVaeCollectives: {
                      rows: [
                        {
                          id: "115c2693-b625-491b-8b91-c7b3875d86a0",
                          raisonSociale: "commanditaire1",
                          createdAt: "2021-01-01T00:00:00Z",
                        },
                        {
                          id: "df0457c6-bc0b-4593-aa99-54bd5ec12ab8",
                          raisonSociale: "commanditaire2",
                          createdAt: "2021-01-01T00:00:00Z",
                        },
                      ],
                      info: {
                        totalRows: 2,
                        page: 1,
                        pageSize: 10,
                      },
                    },
                  },
                });
              },
            ),
            mockQueryActiveFeatures(),
          ],
          { scope: "test" },
        ],
      });

      test("it should display 2 cards", async ({ page }) => {
        await login({ page, role: "admin" });

        await page.goto("/vae-collective/commanditaires/");

        await expect(page.getByTestId("commanditaire-card")).toHaveCount(2);
      });

      test("it should lead to the commanditaire cohortes page when i click on the card", async ({
        page,
      }) => {
        await login({ page, role: "admin" });

        await page.goto("/vae-collective/commanditaires/");

        await page.getByTestId("commanditaire-card").first().click();

        await expect(page).toHaveURL(
          "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes",
        );
      });
    });
  });
});
