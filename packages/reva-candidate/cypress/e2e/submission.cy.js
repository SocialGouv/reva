import { stubQuery } from "../utils/graphql";

context("Submission", () => {
  it("log on a submitted project", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacy",
        "candidate2-submitted.json",
      );

      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        "candidate2-submitted.json",
      );

      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();

    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

    cy.get('[data-test="submit-candidacy-tile"] button').should(
      "not.be.disabled",
    );
  });

  it("log on a project taken over", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacy",
        "candidate2-taken-over.json",
      );

      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        "candidate2-submitted.json",
      );

      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();

    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

    cy.get('[data-test="submit-candidacy-tile"] button').should(
      "not.be.disabled",
    );
  });
});
