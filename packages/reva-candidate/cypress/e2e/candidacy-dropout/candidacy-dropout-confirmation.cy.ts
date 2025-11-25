import candidate1Data from "../../fixtures/candidate1.json";
import { stubQuery } from "../../utils/graphql";

import candidacy1DropOut from "./fixtures/candidacy1-dropped-out.json";

const candidate = candidate1Data.data.candidate_getCandidateById;

function interceptCandidacy() {
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
      "candidacies-with-candidacy-1.json",
    );
    stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy1DropOut);
    stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    stubQuery(req, "getCandidacyByIdWithCandidate", candidacy1DropOut);
    stubQuery(req, "getCandidacyByIdForDashboard", candidacy1DropOut);
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

  cy.visit(
    `/candidates/${candidate.id}/candidacies/c6898498-3b07-4b84-9120-b163aacbd916/candidacy-dropout-decision/dropout-confirmation`,
  );
}

context("Candidacy dropout confirmation page", () => {
  it("should let me access the page", function () {
    interceptCandidacy();
    cy.get('[data-testid="candidacy-dropout-confirmation-page"]').should(
      "exist",
    );
    cy.get("h1").should("contain.text", "Votre parcours VAE est abandonné");
  });

  it("should redirect me to the homepage when i click on the back button", function () {
    interceptCandidacy();

    cy.get(
      '[data-testid="candidacy-dropout-confirmation-back-button"]',
    ).click();
    cy.url().should(
      "eq",
      Cypress.config().baseUrl +
        `candidates/${candidate.id}/candidacies/c6898498-3b07-4b84-9120-b163aacbd916/`,
    );
  });
});
