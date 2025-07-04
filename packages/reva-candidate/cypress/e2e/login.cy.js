import { stubQuery } from "../utils/graphql";

const email = "email@example.com";

context("Login", () => {
  it("submit email", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(req, "candidate_askForLogin", "login.json");
    });

    cy.visit("/");
    cy.get('[data-test="login-home"] #emailForMagicLink').type(email);

    cy.get('[data-test="login-home-submit"]').click();
    cy.wait("@candidate_askForLogin");

    cy.get('[data-test="login-confirmation"]');
  });
});
