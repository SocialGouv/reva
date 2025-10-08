import { stubMutation, stubQuery } from "../../utils/graphql";

import candidacy1DropOut from "./fixtures/candidacy1-dropped-out.json";

function interceptCandidacy() {
  cy.intercept("POST", "/api/graphql", (req) => {
    const candidacy = {
      data: {
        getCandidacyById: {
          ...candidacy1DropOut.data.getCandidacyById,
          candidacyDropOut: {
            createdAt: "2021-09-01T00:00:00Z",
            dropOutConfirmedByCandidate: true,
          },
        },
      },
    };

    stubQuery(
      req,
      "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
      "candidacies-with-candidacy-1.json",
    );
    stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
    stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
    stubQuery(req, "getCandidacyByIdForDashboard", candidacy);

    stubMutation(
      req,
      "updateCandidateCandidacyDropoutDecision",
      candidacy1DropOut,
    );
  });
}

context("Candidacy dropout decision page", () => {
  beforeEach(() => {
    interceptCandidacy();
    cy.login();
    cy.wait([
      "@candidate_getCandidateWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);
    cy.visit("/c1/candidacy-dropout-decision/");
  });

  it("should let me access the page", function () {
    cy.get('[data-test="candidacy-dropout-decision-page"]').should("exist");
    cy.get("h1").should("contain.text", "Abandon du parcours VAE");
  });
  it("should let me validate my drop out and lead me to the confirmation page", function () {
    cy.get(".drop-out-confirmation-radio-button~label").click();
    cy.get("button[type=submit]").click();
    cy.wait("@updateCandidateCandidacyDropoutDecision");
    cy.url().should(
      "eq",
      Cypress.config().baseUrl +
        "c1/candidacy-dropout-decision/dropout-confirmation/",
    );
  });
  it("should let me cancel my drop out and redirect me to the homepage", function () {
    cy.get(".drop-out-cancelation-radio-button~label").click();
    cy.get("button[type=submit]").click();
    cy.wait("@updateCandidateCandidacyDropoutDecision");
    cy.url().should("eq", Cypress.config().baseUrl + "c1/");
  });
});
