import { Page } from "@playwright/test";

import aapToken from "./tokens/aapToken.json";

export const login = async ({ page, role }: { page: Page; role: "aap" }) => {
  await page.route(
    "**/auth/realms/reva/protocol/openid-connect/3p-cookies/step1.html",
    async (route) => {
      await route.fulfill({
        path: "tests/shared/helpers/auth/pages/step1.html",
      });
    },
  );
  await page.route(
    "**/realms/reva/protocol/openid-connect/login-status-iframe.html",
    async (route) => {
      await route.fulfill({
        path: "tests/shared/helpers/auth/pages/status-iframe.html",
      });
    },
  );
  await page.route("**/admin2/silent-check-sso.html", async (route) => {
    await route.fulfill({
      path: `tests/shared/helpers/auth/pages/silent-check-sso.html`,
    });
  });

  await page.route(
    "**/realms/reva/protocol/openid-connect/auth**",
    async (route) => {
      await route.fulfill({
        path: `tests/shared/helpers/auth/pages/mock-redirect-to-silent-check-sso.html`,
      });
    },
  );

  if (role === "aap") {
    const tokens = aapToken;

    await page.route(
      "**/realms/reva/protocol/openid-connect/token",
      async (route) => {
        await route.fulfill({
          json: tokens,
        });
      },
    );

    await page.goto(`http://localhost:3003/admin2/`);
  }
};
