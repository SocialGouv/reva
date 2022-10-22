import { stubMutation, stubQuery } from "../utils/graphql";

context("Submission", () => {
  it("log on a submitted project", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate2-submitted.json");
      stubQuery(req, "getReferential", "referential.json");
    });
    cy.visit("/login?token=abc");
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="submission-home-project-submitted"');
  });
});
