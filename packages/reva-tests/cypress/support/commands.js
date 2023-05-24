Cypress.Commands.add("auth", () => {
  cy.intercept(
    "**/realms/reva-app/protocol/openid-connect/3p-cookies/step1.html",
    {
      fixture: "auth-step1.html",
    }
  );

  cy.intercept("GET", "**/realms/reva-app/protocol/openid-connect/auth*", {
    headers: {
      Location: `${
        Cypress.config().baseUrl
      }app/silent-check-sso.html#error=login_required&state=6a5b9f5c-c131-421c-86e0-5b1d6d5bf44b`,
    },
    statusCode: 302,
  });
});

Cypress.Commands.add("login", (config = { token: "abc" }, options) => {
  cy.auth();
  if (config.token) {
    cy.visit(`/app/login?token=${config.token}`, options);
  } else {
    cy.visit(`/app/login`, options);
  }
});

Cypress.Commands.add("admin", (config = { token: "abc" }, options) => {
  cy.intercept("**/realms/reva/protocol/openid-connect/3p-cookies/step1.html", {
    fixture: "admin/auth-step1.html",
  });

  cy.intercept(
    "**/realms/reva/protocol/openid-connect/login-status-iframe.html",
    {
      fixture: "admin/auth-status-iframe.html",
    }
  );

  cy.intercept("GET", "**/admin/silent-check-sso.html", {
    fixture: "admin/auth-silent-check-sso.html",
  });

  cy.intercept("POST", "**/realms/reva/protocol/openid-connect/token", {
    fixture: "admin/auth-token.json",
  });

  cy.visit(`/admin/`, {
    onBeforeLoad(win) {
      // We store a dummy but valid state in localStorage
      win.localStorage.setItem(
        "kc-callback-1c5979bd-a114-4c01-8627-9495a31479cd",
        JSON.stringify({
          state: "1c5979bd-a114-4c01-8627-9495a31479cd",
          nonce: "1dd49d62-bcf3-4420-be03-57651184e431",
          redirectUri:
            "http%3A%2F%2Flocalhost%3A3000%2Fadmin%2Fsilent-check-sso.html",
          prompt: "none",
          expires: 1684838270050,
        })
      );

      const originalLocalStorageRemoveItem = win.localStorage.removeItem;

      // We prevent Keycloak from removing the dummy state from localStorage
      cy.stub(win.localStorage, "removeItem", (key) => {
        if (!key.startsWith("kc-")) {
          originalLocalStorageRemoveItem(key);
        }
      });
    },
  });
});
