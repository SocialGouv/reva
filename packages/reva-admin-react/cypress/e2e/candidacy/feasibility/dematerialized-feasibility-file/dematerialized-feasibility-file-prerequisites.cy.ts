import { stubQuery } from "../../../../utils/graphql";

function visitFeasibilityPrerequisites() {
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
      "feasibilityWithDematerializedFeasibilityFileByCandidacyId",
      "feasibility/dematerialized-feasibility-file-prerequisites.json",
    );

    stubQuery(
      req,
      "candidacy_canAccessCandidacy",
      "security/can-access-candidacy.json",
    );
  });

  cy.collaborateur(
    "/candidacies/57bf364b-8c8b-4ff4-889b-66917e26d7d0/feasibility-aap/prerequisites",
  );

  cy.wait([
    "@activeFeaturesForConnectedUser",
    "@getMaisonMereCGUQuery",
    "@getOrganismForAAPVisibilityCheck",
    "@getAccountInfo",
    "@getCandidacyMenuAndCandidateInfos",
    "@feasibilityWithDematerializedFeasibilityFileByCandidacyId",
    "@candidacy_canAccessCandidacy",
  ]);
}

describe("Dematerialized Feasibility File - Prerequisites Page", () => {
  context("Initial form state", () => {
    // it("should display an empty prerequisites form with disabled submit button if prerequisites are complete", () => {
    //   visitFeasibilityPrerequisites();

    //   cy.get('[data-test="form-buttons"]')
    //     .should("exist")
    //     .within(() => {
    //       cy.get("button").should("be.disabled");
    //     });
    // });
    it("should display an empty prerequisites form with enabled submit button if prerequisites have never been saved", () => {
      visitFeasibilityPrerequisites();

      cy.get('[data-test="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("be.enabled");
        });
    });
  });

  context("No Prerequisites message", () => {
    it("should display a message if no prerequisites are required", () => {
      visitFeasibilityPrerequisites();

      cy.get('[data-test="no-prerequisites-message"]').should("exist");
    });
  });

  context("Prerequisites Management", () => {
    it("should show error when submitting with empty prerequisite label", () => {
      visitFeasibilityPrerequisites();
      cy.get('[data-test="add-prerequisite-button"]').click({ force: true });

      cy.get('[data-test="prerequisite-input-0"]')
        .should("exist")
        .within(() => {
          cy.get('input[name="prerequisites.0.state"][value="ACQUIRED"]').check(
            {
              force: true,
            },
          );
          cy.get(
            'input[name="prerequisites.0.state"][value="ACQUIRED"]',
          ).should("be.checked");
        });

      cy.get('[data-test="form-buttons"]')
        .find('button[type="submit"]')
        .click({ force: true });

      cy.get('[data-test="prerequisite-input-0"]').within(() => {
        cy.get(".fr-error-text").should("exist");
      });
    });

    it("should allow adding multiple prerequisites with different states", () => {
      visitFeasibilityPrerequisites();
      cy.get('[data-test="add-prerequisite-button"]').click({ force: true });

      cy.get('[data-test="prerequisite-input-0"]')
        .should("exist")
        .within(() => {
          cy.get('textarea[name="prerequisites.0.label"]').type(
            "First prerequisite",
          );

          cy.get('input[name="prerequisites.0.state"][value="ACQUIRED"]').check(
            {
              force: true,
            },
          );
        });

      cy.get('[data-test="add-prerequisite-button"]').click();

      cy.get('[data-test="prerequisite-input-1"]')
        .should("exist")
        .within(() => {
          cy.get('textarea[name="prerequisites.1.label"]').type(
            "Second prerequisite",
          );

          cy.get(
            'input[name="prerequisites.1.state"][value="IN_PROGRESS"]',
          ).check({
            force: true,
          });
        });

      cy.get('[data-test="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("not.be.disabled");
        });
    });

    it("should allow removing individual prerequisites", () => {
      visitFeasibilityPrerequisites();

      cy.get('[data-test="add-prerequisite-button"]').click({ force: true });

      cy.get('[data-test="prerequisite-input-0"]')
        .should("exist")
        .within(() => {
          cy.get('textarea[name="prerequisites.0.label"]').type(
            "To be deleted",
          );
        });

      cy.get('[data-test="add-prerequisite-button"]').click();

      cy.get('[data-test="prerequisite-input-0"]').should("exist");
      cy.get('[data-test="prerequisite-input-1"]').should("exist");

      cy.get('[data-test="delete-prerequisite-button-0"]').click();

      cy.get('[data-test="prerequisite-input-0"]').should("exist");
      cy.get('[data-test="prerequisite-input-1"]').should("not.exist");
    });

    it("should allow toggling between all prerequisite states", () => {
      visitFeasibilityPrerequisites();

      cy.get('[data-test="add-prerequisite-button"]').click({ force: true });

      cy.get('[data-test="prerequisite-input-0"]')
        .should("exist")
        .within(() => {
          cy.get('textarea[name="prerequisites.0.label"]').type(
            "Test prerequisite",
          );

          cy.get('input[name="prerequisites.0.state"][value="ACQUIRED"]').check(
            {
              force: true,
            },
          );
          cy.get(
            'input[name="prerequisites.0.state"][value="IN_PROGRESS"]',
          ).check({
            force: true,
          });
        });
    });
  });

  context("Navigation", () => {
    it("should provide navigation back to feasibility summary", () => {
      visitFeasibilityPrerequisites();

      cy.get('[data-test="back-button"]').click();

      cy.url().should("include", "/feasibility-aap");
    });
  });
});
