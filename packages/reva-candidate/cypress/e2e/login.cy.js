import { stubQuery } from "../utils/graphql";

const email = "email@example.com";

context("Login", () => {
  it("submit email", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(req, "candidate_askForLogin", "login.json");
    });

    cy.visit("/");
    cy.get('[data-testid="login-home"] #emailForMagicLink').type(email);

    cy.get('[data-testid="login-home-submit"]').click();
    cy.wait("@candidate_askForLogin");

    cy.get('[data-testid="login-confirmation"]');
  });
});
