import { stubQuery } from "../../utils/graphql";

import candidacy1DropOut from "./fixtures/candidacy1-dropped-out.json";

function interceptCandidacy() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
      "candidacies-with-candidacy-1.json",
    );
    stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy1DropOut);
    stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    stubQuery(req, "getCandidacyByIdWithCandidate", candidacy1DropOut);
    stubQuery(req, "getCandidacyByIdForDashboard", candidacy1DropOut);
  });
  cy.login();

  cy.wait([
    "@candidate_getCandidateWithCandidaciesForCandidaciesGuard",
    "@activeFeaturesForConnectedUser",
    "@getCandidacyByIdForCandidacyGuard",
    "@getCandidacyByIdWithCandidate",
    "@getCandidacyByIdForDashboard",
  ]);

  cy.visit("/c1/candidacy-dropout-decision/dropout-confirmation");
}

context("Candidacy dropout confirmation page", () => {
  it("should let me access the page", function () {
    interceptCandidacy();
    cy.get('[data-test="candidacy-dropout-confirmation-page"]').should("exist");
    cy.get("h1").should("contain.text", "Votre parcours VAE est abandonné");
  });

  it("should redirect me to the homepage when i click on the back button", function () {
    interceptCandidacy();

    cy.get('[data-test="candidacy-dropout-confirmation-back-button"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "c1/");
  });
});
