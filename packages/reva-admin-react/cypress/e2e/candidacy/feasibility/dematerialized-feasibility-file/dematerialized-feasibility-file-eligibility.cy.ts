import { stubQuery } from "../../../../utils/graphql";

import {
  DF_FORMATED_DATE_6_MONTHS_AGO,
  DF_FORMATED_DATE_6_MONTHS_FROM_NOW,
} from "./dff-mocks";

function visitFeasibilityEligibility() {
  cy.fixture("candidacy/candidacy-dff.json").then((candidacy) => {
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
      stubQuery(req, "getAccountInfo", "account/gestionnaire-info.json");
      stubQuery(
        req,
        "getCandidacyByIdForAapFeasibilityEligibilityPage",
        candidacy,
      );

      stubQuery(
        req,
        "getCandidacyMenuAndCandidateInfos",
        "candidacy/candidacy-menu-dff.json",
      );

      stubQuery(
        req,
        "candidacy_canAccessCandidacy",
        "security/can-access-candidacy.json",
      );
    });
  });

  cy.collaborateur(
    "/candidacies/57bf364b-8c8b-4ff4-889b-66917e26d7d0/feasibility-aap/eligibility",
  );

  cy.wait([
    "@activeFeaturesForConnectedUser",
    "@getMaisonMereCGUQuery",
    "@getAccountInfo",
    "@getCandidacyMenuAndCandidateInfos",
    "@getCandidacyByIdForAapFeasibilityEligibilityPage",
    "@candidacy_canAccessCandidacy",
  ]);
}

describe("Dematerialized Feasibility File Eligibility Page", () => {
  context("Initial form state", () => {
    it("should have disabled form buttons by default", function () {
      visitFeasibilityEligibility();

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("be.disabled");
        });
    });
  });

  context("First-time eligibility request", () => {
    it("should disable date and time fields when TOTAL eligibility is selected", function () {
      visitFeasibilityEligibility();

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("be.disabled");
        });

      cy.get('[data-testid="eligibility-select"]')
        .children("select")
        .select("TOTAL");

      cy.get('[data-testid="eligibility-valid-until-input"]')
        .should("exist")
        .within(() => {
          cy.get("input").should("be.disabled");
        });

      cy.get('[data-testid="eligibility-time-enough-radio-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("input").should("be.disabled");
        });

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("not.be.disabled");
        });
    });
  });

  context("Existing candidate eligibility", () => {
    it("should handle PARTIAL eligibility with future date validation", function () {
      visitFeasibilityEligibility();

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("be.disabled");
        });

      cy.get('[data-testid="eligibility-select"]')
        .children("select")
        .select("PARTIAL");

      cy.get('[data-testid="eligibility-valid-until-input"]')
        .should("exist")
        .within(() => {
          cy.get("input")
            .should("not.be.disabled")
            .clear()
            .type(DF_FORMATED_DATE_6_MONTHS_FROM_NOW);
        });

      cy.get('[data-testid="eligibility-time-enough-radio-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("input")
            .should("not.be.disabled")
            .first()
            .check({ force: true });
        });

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("not.be.disabled");
        });
    });

    it("should show error message when submitting PARTIAL eligibility with past date", function () {
      visitFeasibilityEligibility();

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("be.disabled");
        });

      cy.get('[data-testid="eligibility-select"]')
        .children("select")
        .select("PARTIAL");

      cy.get('[data-testid="eligibility-valid-until-input"]')
        .should("exist")
        .within(() => {
          cy.get("input")
            .should("not.be.disabled")
            .clear()
            .type(DF_FORMATED_DATE_6_MONTHS_AGO);
        });

      cy.get('[data-testid="eligibility-time-enough-radio-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("input")
            .should("not.be.disabled")
            .first()
            .check({ force: true });
        });

      cy.get('[data-testid="eligibility-valid-until-input"]').within(() => {
        cy.get('[class*="fr-error-text"]').should("not.exist");
      });

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("not.be.disabled");
          cy.get("button").last().click();
        });

      cy.get('[data-testid="eligibility-valid-until-input"]').within(() => {
        cy.get('[class*="fr-error-text"]').should("exist");
      });
    });

    context("RNCP code changes", () => {
      it("should disable date and time fields when PARTIAL_WITH_CHANGE eligibility is selected", function () {
        visitFeasibilityEligibility();

        cy.get('[data-testid="form-buttons"]')
          .should("exist")
          .within(() => {
            cy.get("button").should("be.disabled");
          });

        cy.get('[data-testid="eligibility-select"]')
          .children("select")
          .select("PARTIAL_WITH_CHANGE");

        cy.get('[data-testid="eligibility-valid-until-input"]')
          .should("exist")
          .within(() => {
            cy.get("input").should("be.disabled");
          });

        cy.get('[data-testid="eligibility-time-enough-radio-buttons"]')
          .should("exist")
          .within(() => {
            cy.get("input").should("be.disabled");
          });

        cy.get('[data-testid="form-buttons"]')
          .should("exist")
          .within(() => {
            cy.get("button").should("not.be.disabled");
          });
      });
    });

    context("No RNCP code changes", () => {
      it("should handle PARTIAL_WITHOUT_CHANGE eligibility with future date validation", function () {
        visitFeasibilityEligibility();

        cy.get('[data-testid="form-buttons"]')
          .should("exist")
          .within(() => {
            cy.get("button").should("be.disabled");
          });

        cy.get('[data-testid="eligibility-select"]')
          .children("select")
          .select("PARTIAL_WITHOUT_CHANGE");

        cy.get('[data-testid="eligibility-valid-until-input"]')
          .should("exist")
          .within(() => {
            cy.get("input")
              .should("not.be.disabled")
              .clear()
              .type(DF_FORMATED_DATE_6_MONTHS_FROM_NOW);
          });

        cy.get('[data-testid="eligibility-time-enough-radio-buttons"]')
          .should("exist")
          .within(() => {
            cy.get("input")
              .should("not.be.disabled")
              .first()
              .check({ force: true });
          });

        cy.get('[data-testid="form-buttons"]')
          .should("exist")
          .within(() => {
            cy.get("button").should("not.be.disabled");
          });
      });
    });
  });
});
