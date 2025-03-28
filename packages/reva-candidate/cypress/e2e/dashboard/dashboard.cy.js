import { stubQuery } from "../../utils/graphql";

context("Candidate Dashboard", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate1.json");
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        "candidate1.json",
      );
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: ["CANDIDATE_DASHBOARD"],
        },
      });
    });

    cy.login();

    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@candidate_getCandidateWithCandidacyForDashboard");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.visit("/");
  });

  describe("Feature Flag Control", () => {
    it("should show dashboard when feature flag is enabled", () => {
      cy.get('[data-test="candidate-dashboard"]').should("be.visible");
    });

    it("should show timeline when feature flag is disabled", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: {
            activeFeaturesForConnectedUser: [],
          },
        });
      });

      cy.get('[data-test="project-home-ready"]').should("be.visible");
    });
  });
});
