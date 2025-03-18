import { stubQuery } from "../utils/graphql";

context("Submission", () => {
  it("log on a submitted project", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacy",
        "candidate2-submitted.json",
      );

      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();

    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="project-submitted-label"');
  });

  it("log on a project taken over", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacy",
        "candidate2-taken-over.json",
      );

      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();

    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="project-submitted-label"');
  });
});
