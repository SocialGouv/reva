import { Page } from "@playwright/test";

import candidateToken from "@tests/fixtures/auth/candidate-token.json";

const KEYCLOAK = "**/realms/reva-app/protocol/openid-connect";
const STEP = "tests/fixtures/auth/pages/step1.html";
const STATUS_IFRAME = "tests/fixtures/auth/pages/status-iframe.html";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

async function setupKeycloakMocks(page: Page) {
  await page.route(`${KEYCLOAK}/3p-cookies/step1.html`, (route) =>
    route.fulfill({ path: STEP }),
  );
  await page.route(`${KEYCLOAK}/3p-cookies/step2.html`, (route) =>
    route.fulfill({ path: STEP }),
  );
  await page.route(`${KEYCLOAK}/login-status-iframe.html`, (route) =>
    route.fulfill({ path: STATUS_IFRAME }),
  );
  await page.route(`${KEYCLOAK}/token`, (route) =>
    route.fulfill({ json: candidateToken }),
  );
}

async function setupAuthenticated(page: Page) {
  await page.context().addCookies([
    {
      name: "tokens",
      value: encodeURIComponent(
        JSON.stringify({ accessToken: TOKEN, refreshToken: TOKEN }),
      ),
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto("login?token=abc");
}

async function setupUnauthenticated(page: Page) {
  await page.route(`${KEYCLOAK}/auth?*`, async (route) => {
    const url = new URL(route.request().url());
    const state = url.searchParams.get("state") || "mock-state";
    const redirectUri =
      url.searchParams.get("redirect_uri") ||
      "http://localhost:4004/candidat/silent-check-sso.html";

    await route.fulfill({
      status: 302,
      headers: {
        Location: `${redirectUri}#error=login_required&state=${state}`,
      },
    });
  });
  await page.goto("login");
}

export async function login(page: Page, { authenticated = true } = {}) {
  await setupKeycloakMocks(page);
  if (authenticated) {
    await setupAuthenticated(page);
  } else {
    await setupUnauthenticated(page);
  }
}
