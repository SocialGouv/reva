import { stubQuery } from "../utils/graphql";

const email = "email@example.com";

context("Login", () => {
  it("submit email", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubQuery(req, "candidate_askForLogin", "registration.json");
    });
    cy.visit("/");

    cy.get('[data-test="project-contact-login"]').click();

    cy.get('[data-test="login-home"]');

    cy.get('[data-test="login-home"] #email').type(email);

    cy.get('[data-test="login-home-submit"]').click();
    cy.wait("@candidate_askForLogin");

    cy.get('[data-test="login-confirmation"]');
  });
});
