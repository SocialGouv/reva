import candidate1Data from "../../fixtures/candidate1.json";
import { stubMutation, stubQuery } from "../../utils/graphql";

import candidacy1DroppedOut from "./fixtures/candidacy1-dropped-out.json";

const candidate = candidate1Data.data.candidate_getCandidateById;

function interceptCandidacy() {
  cy.intercept("POST", "/api/graphql", (req) => {
    const candidacy = {
      data: {
        getCandidacyById: {
          ...candidacy1DroppedOut.data.getCandidacyById,
          candidacyDropOut: {
            createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
            dropOutConfirmedByCandidate: false,
            proofReceivedByAdmin: false,
          },
        },
      },
    };

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
    stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
    stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
    stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
    stubQuery(
      req,
      "getCandidacyByIdWithCandidateForDropOutDecision",
      candidacy,
    );

    stubMutation(req, "updateCandidateCandidacyDropoutDecision", {
      data: {
        candidacy_updateCandidateCandidacyDropoutDecision: {
          id: candidacy.data.getCandidacyById.id,
        },
      },
    });
  });
}

context("Candidacy dropout decision page", () => {
  beforeEach(() => {
    interceptCandidacy();
    cy.login();
    cy.wait([
      "@candidate_getCandidateForCandidatesGuard",
      "@getCandidateByIdForCandidateGuard",
      "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdForDashboard",
    ]);
    cy.visit(
      `/candidates/${candidate.id}/candidacies/c6898498-3b07-4b84-9120-b163aacbd916/candidacy-dropout-decision/`,
    );
  });

  it("should let me access the page", function () {
    cy.get('[data-testid="candidacy-dropout-decision-page"]').should("exist");
    cy.get("h1").should("contain.text", "Abandon d’une candidature VAE");
  });

  it("should let me validate my drop out and lead me to the confirmation page", function () {
    cy.get(".drop-out-confirmation-radio-button~label").click();
    cy.get("button[type=submit]").click();
    cy.wait("@updateCandidateCandidacyDropoutDecision");
    cy.url().should(
      "eq",
      Cypress.config().baseUrl +
        `candidates/${candidate.id}/candidacies/c6898498-3b07-4b84-9120-b163aacbd916/candidacy-dropout-decision/dropout-confirmation/`,
    );
  });

  it("should let me cancel my drop out and redirect me to the homepage", function () {
    cy.get(".drop-out-cancelation-radio-button~label").click();

    cy.intercept("POST", "/api/graphql", (req) => {
      const candidacy = {
        data: {
          getCandidacyById: {
            ...candidacy1DroppedOut.data.getCandidacyById,
            candidacyDropOut: null,
          },
        },
      };

      stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
      stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
      stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
      stubQuery(
        req,
        "getCandidacyByIdWithCandidateForDropOutDecision",
        candidacy,
      );
    });

    cy.get("button[type=submit]").click();

    cy.wait("@updateCandidateCandidacyDropoutDecision");

    cy.wait("@getCandidacyByIdWithCandidateForDropOutDecision");

    cy.url().should(
      "eq",
      Cypress.config().baseUrl +
        `candidates/${candidate.id}/candidacies/${candidacy1DroppedOut.data.getCandidacyById.id}/`,
    );
  });
});
