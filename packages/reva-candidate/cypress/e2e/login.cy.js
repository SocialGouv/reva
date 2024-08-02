import { stubQuery } from "../utils/graphql";

const email = "email@example.com";

context("Login", () => {
  it("submit email", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getDepartments", "departments.json");
      stubQuery(req, "candidate_askForLogin", "login.json");
    });

    cy.login();

    cy.get('[data-test="login-home"] #email').type(email);

    cy.get('[data-test="login-home-submit"]').click();
    cy.wait("@candidate_askForLogin");

    cy.get('[data-test="login-confirmation"]');
  });

  it("access login page from registration page", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getDepartments", "departments.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });

    cy.visit("/registration");
    cy.get('[data-test="navigate-to-login"]').click();
    cy.get('[data-test="login-home"]');
  });
});
