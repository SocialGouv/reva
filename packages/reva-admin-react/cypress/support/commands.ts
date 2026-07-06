// Cookie names must match keycloak.utils.ts
const STORAGE_KEY = "REVA_ADMIN_AUTH_TOKENS";
const ACCESS_TOKEN_COOKIE = `${STORAGE_KEY}_ACCESS_TOKEN`;
const REFRESH_TOKEN_COOKIE = `${STORAGE_KEY}_REFRESH_TOKEN`;
const ID_TOKEN_COOKIE = `${STORAGE_KEY}_ID_TOKEN`;

function auth({ url, token }: { url: string; token: string }) {
  cy.intercept("POST", "**/realms/reva/protocol/openid-connect/token", {
    fixture: token,
  });

  // Intercept Keycloak logout so tests don't need a running Keycloak server.
  // Redirects to logout-confirmation regardless of id_token_hint or redirect_uri.
  cy.intercept("GET", "**/openid-connect/logout**", (req) => {
    req.reply({
      statusCode: 302,
      headers: { location: `${Cypress.config("baseUrl")}/logout-confirmation` },
    });
  });

  // The new auth flow reads tokens from cookies (check-sso is no longer used
  // except during impersonation). Set cookies so getTokens() returns them.
  cy.fixture(token).then((tokenData) => {
    cy.setCookie(ACCESS_TOKEN_COOKIE, tokenData.access_token, {
      path: "/admin2",
    });
    cy.setCookie(REFRESH_TOKEN_COOKIE, tokenData.refresh_token, {
      path: "/admin2",
    });
    cy.setCookie(
      ID_TOKEN_COOKIE,
      tokenData.id_token ?? tokenData.access_token,
      {
        path: "/admin2",
      },
    );
  });

  cy.visit(url);
}

Cypress.Commands.add("collaborateur", (url = "/") => {
  auth({ url, token: "auth/collaborateur-token.json" });
});

Cypress.Commands.add("gestionnaire", (url = "/") => {
  auth({ url, token: "auth/gestionnaire-token.json" });
});

Cypress.Commands.add("admin", (url = "/") => {
  auth({ url, token: "auth/admin-token.json" });
});

Cypress.Commands.add("certificateur", (url = "/") => {
  auth({ url, token: "auth/certificateur-token.json" });
});

Cypress.Commands.add("certificateurLocalAccount", (url = "/") => {
  auth({ url, token: "auth/certificateur-local-account-token.json" });
});

Cypress.Commands.add("certificateurRegistryManager", (url = "/") => {
  auth({ url, token: "auth/certificateur-registry-manager-token.json" });
});
