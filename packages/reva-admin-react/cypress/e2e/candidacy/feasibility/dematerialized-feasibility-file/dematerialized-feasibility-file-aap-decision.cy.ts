import { stubQuery } from "../../../../utils/graphql";

function visitFeasibilityDecision() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "activeFeaturesForConnectedUser",
      "features/active-features.json",
    );
    stubQuery(
      req,
      "getMaisonMereCGUQuery",
      "account/gestionnaire-cgu-accepted.json",
    );
    stubQuery(
      req,
      "getOrganismForAAPVisibilityCheck",
      "visibility/organism.json",
    );
    stubQuery(req, "getAccountInfo", "account/gestionnaire-info.json");

    stubQuery(
      req,
      "getCandidacyMenuAndCandidateInfos",
      "candidacy/candidacy-menu-dff.json",
    );

    stubQuery(
      req,
      "feasibilityWithDematerializedFeasibilityFileDecisionByCandidacyId",
      {},
    );

    stubQuery(
      req,
      "candidacy_canAccessCandidacy",
      "security/can-access-candidacy.json",
    );
  });

  cy.collaborateur(
    "/candidacies/57bf364b-8c8b-4ff4-889b-66917e26d7d0/feasibility-aap/decision",
  );

  cy.wait([
    "@activeFeaturesForConnectedUser",
    "@getMaisonMereCGUQuery",
    "@getOrganismForAAPVisibilityCheck",
    "@getAccountInfo",
    "@getCandidacyMenuAndCandidateInfos",
    "@feasibilityWithDematerializedFeasibilityFileDecisionByCandidacyId",
    "@candidacy_canAccessCandidacy",
  ]);
}

describe("Dematerialized Feasibility File - AAP Decision Page", () => {
  context("Initial form state", () => {
    it("should display an empty form with submit button disabled", () => {
      visitFeasibilityDecision();

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("be.disabled");
        });
    });
  });

  context("Decision form validation and submission", () => {
    it("should display an error when submitting without selecting a decision", () => {
      visitFeasibilityDecision();

      cy.get('[data-testid="aap-decision-comment-input"]').type(
        "This is a valid comment for the decision",
      );

      cy.get('[data-testid="form-buttons"]')
        .find('button[type="submit"]')
        .click();

      cy.get('[data-testid="aap-decision-radio-buttons"]').within(() => {
        cy.get(".fr-message--error").should("exist");
      });
    });

    it("should display an error when submitting without a comment", () => {
      visitFeasibilityDecision();

      cy.get(
        '[data-testid="aap-decision-radio-buttons"] input[value="FAVORABLE"]',
      ).check({
        force: true,
      });

      cy.get('[data-testid="form-buttons"]')
        .find('button[type="submit"]')
        .click();

      cy.get(".fr-error-text").should("exist");
    });

    it("should enable submit button when form is filled correctly", () => {
      visitFeasibilityDecision();

      cy.get(
        '[data-testid="aap-decision-radio-buttons"] input[value="FAVORABLE"]',
      ).check({
        force: true,
      });

      cy.get('[data-testid="aap-decision-comment-input"]').type(
        "This is a valid comment for the decision",
      );

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("not.be.disabled");
        });
    });

    it("should allow switching between favorable and unfavorable decisions", () => {
      visitFeasibilityDecision();

      cy.get('[data-testid="aap-decision-radio-buttons"]').within(() => {
        cy.get('input[value="FAVORABLE"]').check({
          force: true,
        });
      });

      cy.get('[data-testid="aap-decision-radio-buttons"]').within(() => {
        cy.get('input[value="UNFAVORABLE"]').check({
          force: true,
        });
      });
    });
  });

  context("Navigation", () => {
    it("should provide a back link to the feasibility summary", () => {
      visitFeasibilityDecision();
      cy.get('[data-testid="back-button"]').click();

      cy.url().should("include", "/feasibility-aap");
    });
  });
});
