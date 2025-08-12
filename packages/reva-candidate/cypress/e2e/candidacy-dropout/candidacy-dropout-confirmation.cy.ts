import { stubQuery } from "../../utils/graphql";

import candidateDropOut from "./fixtures/candidate-dropped-out.json";
function interceptCandidacy() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "candidate_getCandidateWithCandidacyForLayout",
      candidateDropOut,
    );
    stubQuery(
      req,
      "candidate_getCandidateWithCandidacyForHome",
      candidateDropOut,
    );
    stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    stubQuery(
      req,
      "candidate_getCandidateWithCandidacyForDashboard",
      candidateDropOut,
    );
  });
  cy.login();

  cy.wait([
    "@candidate_getCandidateWithCandidacyForLayout",
    "@candidate_getCandidateWithCandidacyForHome",
    "@candidate_getCandidateWithCandidacyForDashboard",
  ]);
  cy.visit("/candidacy-dropout-decision/dropout-confirmation");
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
    cy.url().should("eq", Cypress.config().baseUrl);
  });
});
