import { stubMutation, stubQuery } from "../../utils/graphql";
import candidateDropOut from "./fixtures/candidate-dropped-out.json";
function interceptCandidacy() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubMutation(req, "candidate_login", "candidate_login.json");
    stubQuery(req, "candidate_getCandidateWithCandidacy", candidateDropOut);
    stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
  });
}

context("Candidacy dropout confirmation page", () => {
  it("should let me access the page", function () {
    interceptCandidacy();
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.visit("/candidacy-dropout-decision/dropout-confirmation");
    cy.get('[data-test="candidacy-dropout-confirmation-page"]').should("exist");
    cy.get("h1").should("contain.text", "Votre parcours VAE est abandonné");
  });

  it("should redirect me to the homepage when i click on the back button", function () {
    interceptCandidacy();
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.visit("/candidacy-dropout-decision/dropout-confirmation");
    cy.get('[data-test="candidacy-dropout-confirmation-back-button"]').click();
    cy.url().should("eq", Cypress.config().baseUrl);
  });
});
