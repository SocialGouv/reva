import { stubQuery } from "../../../../utils/graphql";

function visitFeasibilityCompetenciesBlock() {
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
      "getBlocDeCompetencesForCompetenciesBlockPage",
      "feasibility/dematerialized-feasibility-file-bloc-de-competences.json",
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

  cy.collaborateur(
    "/candidacies/57bf364b-8c8b-4ff4-889b-66917e26d7d0/feasibility-aap/competencies-blocks/4c06558e-8e3e-4559-882e-321607a6b4e1/",
  );

  cy.wait([
    "@activeFeaturesForConnectedUser",
    "@getMaisonMereCGUQuery",
    "@getAccountInfo",
    "@getCandidacyMenuAndCandidateInfos",
    "@getBlocDeCompetencesForCompetenciesBlockPage",
    "@candidacy_canAccessCandidacy",
  ]);
}

describe("Dematerialized Feasibility File - Competencies Block Page", () => {
  context("Form Initial State", () => {
    it("should display the competencies block form with disabled submit button", function () {
      visitFeasibilityCompetenciesBlock();

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("be.disabled");
        });
    });
  });

  context("Block Comment Section", () => {
    it("should enable submit button when adding a valid block comment", function () {
      visitFeasibilityCompetenciesBlock();

      cy.get('[data-testid="block-comment-input"]')
        .should("exist")
        .type("Test comment for the block");

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("not.be.disabled");
        });
    });

    it("should keep submit button disabled when block comment is empty", function () {
      visitFeasibilityCompetenciesBlock();

      cy.get('[data-testid="block-comment-input"]')
        .should("exist")
        .and("have.value", "");

      cy.get('[data-testid="form-buttons"]')
        .find('button[type="submit"]')
        .should("be.disabled");
    });
  });

  context("Navigation", () => {
    it("should provide a link back to the feasibility summary page", function () {
      visitFeasibilityCompetenciesBlock();

      cy.get('[data-testid="back-button"]').click();

      cy.url().should("include", "/feasibility-aap");
    });
  });
});
