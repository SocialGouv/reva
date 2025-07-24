import { stubMutation, stubQuery } from "../../utils/graphql";

import candidateDropOut from "./fixtures/candidate-dropped-out.json";

function interceptCandidacy() {
  cy.intercept("POST", "/api/graphql", (req) => {
    const candidate = {
      ...candidateDropOut.data.candidate_getCandidateWithCandidacy,
      candidacy: {
        ...candidateDropOut.data.candidate_getCandidateWithCandidacy.candidacy,
        candidacyDropOut: {
          createdAt: "2021-09-01T00:00:00Z",
          dropOutConfirmedByCandidate: true,
        },
      },
    };
    stubMutation(
      req,
      "updateCandidateCandidacyDropoutDecision",
      candidateDropOut,
    );
    stubQuery(req, "candidate_getCandidateWithCandidacy", {
      data: {
        candidate_getCandidateWithCandidacy: candidate,
      },
    });
    stubQuery(req, "candidate_getCandidateWithCandidacyForDashboard", {
      data: {
        candidate_getCandidateWithCandidacy: candidate,
      },
    });
    stubQuery(req, "getCandidacyForDropOutDecisionPage", {
      data: {
        candidate_getCandidateWithCandidacy: {
          candidacy: {
            id: "c1",
          },
        },
      },
    });
    stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
  });
}

context("Candidacy dropout decision page", () => {
  beforeEach(() => {
    interceptCandidacy();
    cy.login();
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.visit("/candidacy-dropout-decision/");
    cy.wait("@getCandidacyForDropOutDecisionPage");
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
        "candidacy-dropout-decision/dropout-confirmation/",
    );
  });
  it("should let me cancel my drop out and redirect me to the homepage", function () {
    cy.get(".drop-out-cancelation-radio-button~label").click();
    cy.get("button[type=submit]").click();
    cy.wait("@updateCandidateCandidacyDropoutDecision");
    cy.url().should("eq", Cypress.config().baseUrl);
  });
});
