import candidate1Data from "../fixtures/candidate1.json";
import { stubQuery } from "../utils/graphql";

context("Submission", () => {
  it("log on a submitted project", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateForCandidatesGuard",
        "candidate1-for-candidates-guard.json",
      );
      stubQuery(req, "getCandidateByIdForCandidateGuard", candidate1Data);
      stubQuery(
        req,
        "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-2.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForCandidacyGuard",
        "candidacy2-submitted.json",
      );
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "getCandidacyByIdWithCandidate",
        "candidacy2-submitted.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForDashboard",
        "candidacy2-submitted.json",
      );
    });
    cy.login();

    cy.wait([
      "@candidate_getCandidateForCandidatesGuard",
      "@getCandidateByIdForCandidateGuard",
      "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);

    cy.get('[data-testid="submit-candidacy-tile"] button').should(
      "not.be.disabled",
    );
  });

  it("log on a project taken over", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateForCandidatesGuard",
        "candidate1-for-candidates-guard.json",
      );
      stubQuery(req, "getCandidateByIdForCandidateGuard", candidate1Data);
      stubQuery(
        req,
        "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-2.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForCandidacyGuard",
        "candidacy2-taken-over.json",
      );
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "getCandidacyByIdWithCandidate",
        "candidacy2-taken-over.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForDashboard",
        "candidacy2-taken-over.json",
      );
    });
    cy.login();

    cy.wait([
      "@candidate_getCandidateForCandidatesGuard",
      "@getCandidateByIdForCandidateGuard",
      "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);

    cy.get('[data-testid="submit-candidacy-tile"] button').should(
      "not.be.disabled",
    );
  });
});
