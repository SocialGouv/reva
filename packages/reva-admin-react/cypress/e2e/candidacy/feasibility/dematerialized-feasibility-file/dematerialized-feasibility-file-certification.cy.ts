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
        "account/head-agency-cgu-accepted.json",
      );
      stubQuery(
        req,
        "getOrganismForAAPVisibilityCheck",
        "visibility/organism.json",
      );
      stubQuery(req, "getAccountInfo", "account/head-agency-info.json");
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
    });
  });

  cy.collaborateur(
    "/candidacies/57bf364b-8c8b-4ff4-889b-66917e26d7d0/feasibility-aap/certification",
  );
}

describe("Dematerialized Feasibility File Certification Page", () => {
  context("Initial form state", () => {
    it("should have enabled form buttons and pre-checked competence bloc checkboxes", function () {
      visitFeasibilityCertification();

      cy.get('[data-test="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("not.be.disabled");
        });

      cy.get('input[type="checkbox"]').should("be.checked");
    });
  });

  context("Certification type selection", () => {
    it("should select all competence blocs when switching to complete certification", function () {
      visitFeasibilityCertification();

      cy.get('[data-test="certification-completion-radio-buttons"]')
        .find('input[value="PARTIAL"]')
        .check({ force: true });

      cy.get('input[type="checkbox"]').should("not.be.checked");

      cy.get('[data-test="certification-completion-radio-buttons"]')
        .find('input[value="COMPLETE"]')
        .check({ force: true });

      cy.get('input[type="checkbox"]').should("be.checked");

      cy.get('[data-test="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("not.be.disabled");
        });
    });

    it("should uncheck all competence blocs when switching to partial certification", function () {
      visitFeasibilityCertification();

      cy.get('[data-test="certification-completion-radio-buttons"]')
        .find('input[value="PARTIAL"]')
        .check({ force: true });

      cy.get('input[type="checkbox"]').should("not.be.checked");
    });
  });

  context("Optional fields", () => {
    it("should allow filling optional certification details and selecting specific competence blocs", function () {
      visitFeasibilityCertification();

      cy.get('[data-test="certification-option-input"]')
        .find("input")
        .should("exist")
        .type("Test Option");

      cy.get('[data-test="certification-first-foreign-language-input"]')
        .find("input")
        .should("exist")
        .type("English");

      cy.get('[data-test="certification-second-foreign-language-input"]')
        .find("input")
        .should("exist")
        .type("Spanish");

      cy.get('[data-test="certification-completion-radio-buttons"]')
        .find('input[value="PARTIAL"]')
        .check({ force: true });

      cy.get('input[type="checkbox"]').should("not.be.checked");

      cy.get('input[type="checkbox"]').first().check({ force: true });

      cy.get('[data-test="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("not.be.disabled");
        });
    });
  });
});
