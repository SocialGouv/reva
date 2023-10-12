Cypress.Commands.add("aap", (config = { token: "abc" }) => {
  cy.intercept("**/realms/reva/protocol/openid-connect/3p-cookies/step1.html", {
    fixture: "auth-step1.html",
  });

  cy.intercept(
    "**/realms/reva/protocol/openid-connect/login-status-iframe.html",
    {
      fixture: "auth-status-iframe.html",
    }
  );

  cy.intercept("GET", "**/admin/silent-check-sso.html", {
    fixture: "auth-silent-check-sso.html",
  });

  cy.intercept("POST", "**/realms/reva/protocol/openid-connect/token", {
    fixture: "auth-token.json",
  });

  cy.visit(`/`, {
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
      cy.stub(win.localStorage, "removeItem").callsFake((key) => {
        if (!key.startsWith("kc-")) {
          originalLocalStorageRemoveItem(key);
        }
      });
    },
  });
});
