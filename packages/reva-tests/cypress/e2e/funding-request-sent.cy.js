import { stubMutation, stubQuery } from "../utils/graphql";

context("Funding Request Sent", () => {
  describe("Testing correct screen", () => {
    it("display all fields", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubMutation(
          req,
          "candidate_login",
          "candidate2-funding-request-sent.json"
        );
        stubQuery(req, "getReferential", "referential.json");
      });
      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@getReferential");

      cy.get('[data-test="view-training-program-button"]').should("exist");
    });
  });
});
