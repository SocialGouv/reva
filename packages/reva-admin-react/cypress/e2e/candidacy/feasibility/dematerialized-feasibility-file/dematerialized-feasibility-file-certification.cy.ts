import { stubQuery } from "../../../../utils/graphql";

import { DF_CERTIFICATION } from "./dff-mocks";

function visitFeasibilityCertification() {
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
      stubQuery(
        req,
        "getOrganismForAAPVisibilityCheck",
        "visibility/organism.json",
      );
      stubQuery(req, "getAccountInfo", "account/gestionnaire-info.json");
      candidacy.data.getCandidacyById.certification = DF_CERTIFICATION;

      stubQuery(
        req,
        "getCandidacyByIdForAapFeasibilityCertificationPage",
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
    "/candidacies/57bf364b-8c8b-4ff4-889b-66917e26d7d0/feasibility-aap/certification",
  );

  cy.wait([
    "@activeFeaturesForConnectedUser",
    "@getMaisonMereCGUQuery",
    "@getOrganismForAAPVisibilityCheck",
    "@getAccountInfo",
    "@getCandidacyMenuAndCandidateInfos",
    "@getCandidacyByIdForAapFeasibilityCertificationPage",
    "@candidacy_canAccessCandidacy",
  ]);
}

describe("Dematerialized Feasibility File Certification Page", () => {
  context("Optional fields", () => {
    it("should allow filling optional certification details and selecting specific competence blocs", function () {
      visitFeasibilityCertification();

      cy.get('[data-testid="certification-option-input"]')
        .find("input")
        .should("exist")
        .type("Test Option");

      cy.get('[data-testid="certification-first-foreign-language-input"]')
        .find("input")
        .should("exist")
        .type("English");

      cy.get('[data-testid="certification-second-foreign-language-input"]')
        .find("input")
        .should("exist")
        .type("Spanish");

      cy.get('[data-testid="certification-completion-radio-buttons"]')
        .find('input[value="PARTIAL"]')
        .check({ force: true });

      cy.get('input[type="checkbox"]').should("not.be.checked");

      cy.get('input[type="checkbox"]').first().check({ force: true });

      cy.get('[data-testid="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("not.be.disabled");
        });
    });
  });
});
