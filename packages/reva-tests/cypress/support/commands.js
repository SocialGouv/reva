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
      }silent-check-sso.html#error=login_required&state=6a5b9f5c-c131-421c-86e0-5b1d6d5bf44b`,
    },
    statusCode: 302,
  });
});

Cypress.Commands.add("login", (config = { token: "abc" }, options) => {
  cy.auth();
  if (config.token) {
    cy.visit(`/login?token=${config.token}`, options);
  } else {
    cy.visit(`/login`, options);
  }
});
