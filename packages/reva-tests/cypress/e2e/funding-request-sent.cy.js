import { stubMutation, stubQuery } from "../utils/graphql";

context("Funding Request Sent", () => {
  describe("Testing correct screen", () => {
    it("display all fields", () => {
      cy.intercept("POST", "/graphql", (req) => {
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
      
      cy.get('[data-test="progress-title-value"]').should("have.text", "100%");
      cy.get('[data-test="progress-100"]').should("exist");
      cy.get('[data-test="review-training-form"]').should("exist");
      cy.get('[data-test="ap-organism"]').should("exist");
    });
  });
});