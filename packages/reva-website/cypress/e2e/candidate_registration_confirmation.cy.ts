import { stubQuery } from "cypress/support/graphql";

describe("candidate registration confirmation", () => {
  it("should redirect to the homepage when i click the OK button", () => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "activeFeaturesForConnectedUser",
        "active_features_empty.json"
      );
    });
    cy.visit("http://localhost:3002/inscription-candidat/confirmation");

    cy.get('[data-testid="ok-button"]').click();

    cy.url().should("eq", "http://localhost:3002/");

    cy.wait("@activeFeaturesForConnectedUser");
  });
});
