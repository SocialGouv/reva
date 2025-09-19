import { Page } from "@playwright/test";

import candidateToken from "../fixtures/auth/candidate-token.json";

async function setupAuth(page: Page) {
  await page.route(
    "**/realms/reva-app/protocol/openid-connect/3p-cookies/step1.html",
    async (route) => {
      await route.fulfill({
        path: "tests/fixtures/auth/pages/step1.html",
      });
    },
  );

  await page.route(
    "**/realms/reva-app/protocol/openid-connect/login-status-iframe.html",
    async (route) => {
      await route.fulfill({
        path: "tests/fixtures/auth/pages/status-iframe.html",
      });
    },
  );

  await page.route("**/candidate/silent-check-sso.html", async (route) => {
    await route.fulfill({
      path: "tests/fixtures/auth/pages/silent-check-sso.html",
    });
  });

  await page.route(
    "**/realms/reva-app/protocol/openid-connect/auth**",
    async (route) => {
      await route.fulfill({
        path: "tests/fixtures/auth/pages/mock-redirect-to-silent-check-sso.html",
      });
    },
  );

  await page.route(
    "**/realms/reva-app/protocol/openid-connect/token",
    async (route) => {
      await route.fulfill({
        json: candidateToken,
      });
    },
  );

  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  const tokens = {
    accessToken: TOKEN,
    refreshToken: TOKEN,
  };

  await page.context().addCookies([
    {
      name: "tokens",
      value: encodeURIComponent(JSON.stringify(tokens)),
      domain: "localhost",
      path: "/",
    },
  ]);
}

export async function login(page: Page) {
  await setupAuth(page);
  await page.goto("login?token=abc");
}
