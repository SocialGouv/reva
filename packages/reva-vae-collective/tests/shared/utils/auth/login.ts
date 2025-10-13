import { Page } from "@playwright/test";

import adminToken from "./tokens/adminToken.json";
import gestionnaireVaeCollectiveToken from "./tokens/gestionnaireVaeCollectiveToken.json";

export const login = async ({
  page,
  role,
}: {
  page: Page;
  role: "admin" | "gestionnaireVaeCollective" | "notConnected";
}) => {
  await page.route(
    "**/auth/realms/reva/protocol/openid-connect/3p-cookies/step1.html",
    async (route) => {
      await route.fulfill({
        path: "tests/shared/utils/auth/pages/step1.html",
      });
    },
  );
  await page.route(
    "**/realms/reva/protocol/openid-connect/login-status-iframe.html",
    async (route) => {
      await route.fulfill({
        path: "tests/shared/utils/auth/pages/status-iframe.html",
      });
    },
  );
  await page.route("**/vae-collective/silent-check-sso.html", async (route) => {
    await route.fulfill({
      path: `tests/shared/utils/auth/pages/silent-check-sso.html`,
    });
  });

  await page.route(
    "**/realms/reva/protocol/openid-connect/auth**",
    async (route) => {
      await route.fulfill({
        path: `tests/shared/utils/auth/pages/mock-redirect-to-silent-check-sso.html`,
      });
    },
  );

  if (role === "notConnected") {
    await page.route(
      "**/realms/reva/protocol/openid-connect/token",
      async (route) => {
        await route.fulfill({
          json: {},
        });
      },
    );
  } else {
    const tokens =
      role === "admin" ? adminToken : gestionnaireVaeCollectiveToken;

    await page.route(
      "**/realms/reva/protocol/openid-connect/token",
      async (route) => {
        await route.fulfill({
          json: tokens,
        });
      },
    );

    const tokensForPostLoginUrl = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };

    await page.goto(
      `http://localhost:4005/vae-collective/post-login?tokens=${encodeURIComponent(
        JSON.stringify(tokensForPostLoginUrl),
      )}`,
    );

    await page.waitForTimeout(500); //wait for the post-login page to be loaded and keycloak to be initialized
  }
};
