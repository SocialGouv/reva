import { Page } from "@playwright/test";

import aapCollaborateurToken from "./tokens/aapCollaborateurToken.json";
import aapToken from "./tokens/aapToken.json";
import adminToken from "./tokens/adminToken.json";
import certificateurRegistryManagerToken from "./tokens/certificateurRegistryManagerToken.json";
import certificateurToken from "./tokens/certificateurToken.json";

// Cookie names must match keycloak.utils.ts
const STORAGE_KEY = "REVA_ADMIN_AUTH_TOKENS";
const ACCESS_TOKEN_COOKIE = `${STORAGE_KEY}_ACCESS_TOKEN`;
const REFRESH_TOKEN_COOKIE = `${STORAGE_KEY}_REFRESH_TOKEN`;
const ID_TOKEN_COOKIE = `${STORAGE_KEY}_ID_TOKEN`;
const COOKIE_PATH = "/admin2";

export const login = async ({
  page,
  role,
  loginRequired = false, // when set to true do not authenticate the user and redirect to the login page
}: {
  page: Page;
  role:
    | "aap"
    | "aapCollaborateur"
    | "admin"
    | "certificateur"
    | "certificateurRegistryManager";
  loginRequired?: boolean;
}) => {
  let tokens: typeof aapToken = aapToken;

  switch (role) {
    case "aap":
      tokens = aapToken;
      break;
    case "admin":
      tokens = adminToken;
      break;
    case "aapCollaborateur":
      tokens = aapCollaborateurToken;
      break;
    case "certificateur":
      tokens = certificateurToken;
      break;
    case "certificateurRegistryManager":
      tokens = certificateurRegistryManagerToken;
      break;
  }

  await page.route(
    "**/realms/reva/protocol/openid-connect/token",
    async (route) => {
      await route.fulfill({
        json: tokens,
      });
    },
  );

  // The new auth flow reads tokens from cookies (check-sso is no longer used
  // except during impersonation). Set cookies so getTokens() returns them.
  if (!loginRequired) {
    await page.context().addCookies([
      {
        name: ACCESS_TOKEN_COOKIE,
        value: tokens.access_token,
        path: COOKIE_PATH,
        domain: "localhost",
      },
      {
        name: REFRESH_TOKEN_COOKIE,
        value: tokens.refresh_token,
        path: COOKIE_PATH,
        domain: "localhost",
      },
      {
        name: ID_TOKEN_COOKIE,
        value: tokens.id_token,
        path: COOKIE_PATH,
        domain: "localhost",
      },
    ]);
  }
};
