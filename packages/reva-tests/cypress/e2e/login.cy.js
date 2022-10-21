import { stubMutation, stubQuery } from "../utils/graphql";

const email = "email@example.com";

context("Login", () => {
  it("submit email", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubQuery(req, "candidate_askForLogin", "login.json");
    });
    cy.visit("/");

    cy.get('[data-test="project-contact-login"]').click();

    cy.get('[data-test="login-home"] #email').type(email);

    cy.get('[data-test="login-home-submit"]').click();
    cy.wait("@candidate_askForLogin");

    cy.get('[data-test="login-confirmation"]');
  });

  it("use an expired token", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubMutation(
        req,
        "candidate_confirmRegistration",
        "login-expired.json",
        500
      );
      stubQuery(req, "getReferential", "referential.json");
    });
    cy.visit("/login?token=abc");
    cy.wait("@candidate_confirmRegistration");
    cy.wait("@getReferential");

    cy.get('[data-test="project-contact-invalid-token"]');
  });
});
