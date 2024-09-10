Cypress.Commands.add("auth", () => {
  cy.intercept(
    "**/realms/reva-app/protocol/openid-connect/3p-cookies/step1.html",
    {
      fixture: "auth/step1.html",
    },
  );
  cy.intercept("GET", "**/candidate/silent-check-sso.html", {
    fixture: "auth/silent-check-sso.html",
  });

  cy.intercept("POST", "**/realms/reva-app/protocol/openid-connect/token", {
    fixture: "auth/candidate-token.json",
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
