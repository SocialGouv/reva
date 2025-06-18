import { stubQuery, stubMutation } from "../../../../utils/graphql";
import candidacyWithJuryResult from "./fixtures/candidacy-with-jury-result.json";
import revokeDecisionResponse from "./fixtures/revoke-jury-decision-response.json";
import candidacyWithJuryResultRevoked from "./fixtures/candidacy-with-jury-result-revoked.json";

describe("revoke jury decision", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: [],
        },
      });

      stubQuery(req, "getOrganismForAAPVisibilityCheck", {
        data: null,
        errors: [],
      });

      stubQuery(req, "getAccountInfo", "account/admin-info.json");
    });
  });

  context("As an admin viewing a jury decision", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "getJuryByCandidacyId", candidacyWithJuryResult);

        stubMutation(req, "jury_revokeDecision", revokeDecisionResponse);
      });

      cy.admin("/candidacies/test-candidacy-id/jury/test-jury-id/");
      cy.wait("@getJuryByCandidacyId");

      // Avoid flaky tests by waiting for each tab to be visible
      cy.get('[data-test="jury-date-title"]').should("be.visible");
      cy.get('[role="tab"]').contains("Résultat").click();
      cy.get('[data-test="jury-result-title"]').should("be.visible");
    });

    it("should display revoke button for admins", () => {
      cy.contains("button", "Annuler la décision").should("be.visible");
    });

    it("should handle revoke flow with comment", () => {
      cy.contains("button", "Annuler la décision").click();
      cy.get("#revoke-jury-decision").should("be.visible");
      cy.get("#revoke-jury-decision textarea").type("Test reason");
      cy.get("#revoke-jury-decision button").contains("Confirmer").click();
      cy.get("#revoke-jury-decision").should("not.be.visible");
    });

    it("should close modal on cancel", () => {
      cy.contains("button", "Annuler la décision").click();
      cy.get("#revoke-jury-decision").should("be.visible");
      cy.get("#revoke-jury-decision button").contains("Retour").click();
      cy.get("#revoke-jury-decision").should("not.be.visible");
    });

    it("should confirm revoke successfully with reason and refresh data", () => {
      // Set up intercept for the refetch that will happen after mutation
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "getJuryByCandidacyId", candidacyWithJuryResultRevoked);
      }).as("getJuryByCandidacyIdRefetch");

      // Click revoke button
      cy.contains("button", "Annuler la décision").click();
      cy.get("#revoke-jury-decision").should("be.visible");
      cy.get("#revoke-jury-decision textarea").type("erreur de saisie");

      cy.get("#revoke-jury-decision button").contains("Confirmer").click();

      // Wait for the mutation to complete and the refetch to happen
      cy.wait("@jury_revokeDecision");
      cy.wait("@getJuryByCandidacyIdRefetch");

      // Verify modal is closed and revoke button is no longer shown
      cy.get("#revoke-jury-decision").should("not.exist");
      cy.contains("button", "Annuler la décision").should("not.exist");
    });
  });

  context("As a non-admin user", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "getJuryByCandidacyId", candidacyWithJuryResult);
      });

      cy.certificateur("/candidacies/test-candidacy-id/jury/test-jury-id/");
      cy.wait("@getJuryByCandidacyId");
      cy.get('[data-test="jury-date-title"]').should("be.visible");
      cy.get('[role="tab"]').contains("Résultat").click();
      // Make sure non-visible or non-existent tests start only after the tab content is actually visible (to avoid false-positive)
      cy.get('[data-test="jury-result-title"]').should("be.visible");
    });

    it("should not display revoke button", () => {
      cy.contains("button", "Annuler la décision").should("not.exist");
    });
  });
});
