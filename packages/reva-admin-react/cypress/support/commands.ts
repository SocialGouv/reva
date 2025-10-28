function auth({ url, token }: { url: string; token: string }) {
  cy.intercept("**/realms/reva/protocol/openid-connect/3p-cookies/step1.html", {
    fixture: "auth/step1.html",
  });

  cy.intercept(
    "**/realms/reva/protocol/openid-connect/login-status-iframe.html",
    {
      fixture: "auth/status-iframe.html",
    },
  );

  cy.intercept("GET", "**/admin2/silent-check-sso.html", {
    fixture: "auth/silent-check-sso.html",
  });

  cy.intercept("POST", "**/realms/reva/protocol/openid-connect/token", {
    fixture: token,
  });

  cy.intercept("GET", "**/realms/reva/protocol/openid-connect/auth**", {
    statusCode: 302,
    headers: {
      location: `${Cypress.config("baseUrl")}/silent-check-sso.html#error=login_required`,
    },
  });

  cy.visit(url, {
    onBeforeLoad(win) {
      // We store a dummy but valid state in localStorage
      win.localStorage.setItem(
        "kc-callback-1c5979bd-a114-4c01-8627-9495a31479cd",
        JSON.stringify({
          state: "1c5979bd-a114-4c01-8627-9495a31479cd",
          nonce: "1dd49d62-bcf3-4420-be03-57651184e431",
          redirectUri:
            "http%3A%2F%2Flocalhost%3A3003%2Fadmin2%2Fsilent-check-sso.html",
          prompt: "none",
          expires: 1684838270050,
        }),
      );
      // const originalLocalStorageRemoveItem = win.localStorage.removeItem;

      // // We prevent Keycloak from removing the dummy state from localStorage
      // cy.stub(win.localStorage, "removeItem").callsFake((key) => {
      //   if (!key.startsWith("kc-")) {
      //     originalLocalStorageRemoveItem(key);
      //   }
      // });
    },
  });
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
