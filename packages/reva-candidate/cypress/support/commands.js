Cypress.Commands.add("login", (config = { token: "abc" }, options) => {
  cy.visit(`/login/?token=${config.token}`, options);
});
