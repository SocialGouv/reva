import { stubMutation, stubQuery } from "../utils/graphql";

context("Funding Request Sent", () => {
  describe("Testing correct screen", () => {
    it("display all fields", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubMutation(req, "candidate_login", "candidate_login.json");
        stubQuery(
          req,
          "candidate_getCandidateWithCandidacy",
          "candidate2-funding-request-sent.json",
        );
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      });

      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@candidate_getCandidateWithCandidacy");
      cy.wait("@activeFeaturesForConnectedUser");

      cy.get('[data-test="view-training-program-button"]').should("exist");
    });
  });
});
