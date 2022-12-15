import { stubMutation, stubQuery } from "../utils/graphql";

context("Submission", () => {
  it("log on a dropped-out project", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate2-dropped-out.json");
      stubQuery(req, "getReferential", "referential.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="home-project-dropped-out"');
  });
});