import { stubQuery } from "../../../reva-tests/cypress/utils/graphql";

function testUpdateTraining(mutationName, { isCertificationPartial }) {
  // We prepare the test for the following click on the submit button
  cy.intercept("POST", "/api/graphql", (req) => {
    if (req.body.operationName === "updateCandidacyTraining") {
      expect(
        req.body.query.includes(
          `isCertificationPartial: ${isCertificationPartial}`,
        ),
      ).to.be.true;
    }
    req.reply({
      data: {
        [mutationName]: {},
      },
    });
  }).as("updateCandidacyTraining");
}

context("Candidacy", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "active-features.json");
      stubQuery(req, "getCandidacy", "candidacy1.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "getCandidacyTraining", "training-empty.json");
    });

    cy.aap("/candidacies/7e82e10e-256e-4794-9034-1d2ff4d6d3fc/training");
  });

  it("submit training with full certification scope", function () {
    cy.wait("@getCandidacyTraining");
    cy.get("[for=certificationScope-option-full]").click();

    testUpdateTraining("candidacy_submitTrainingForm3599523568", {
      isCertificationPartial: false,
    });
    cy.get("[type=submit]").click();
    cy.wait("@updateCandidacyTraining");
    cy.get("[role=status]").should("contain", "Confirmation");
  });

  it("submit training form with partial certification scope", function () {
    cy.wait("@getCandidacyTraining");
    cy.get("[for=certificationScope-option-partial]").click();

    testUpdateTraining("candidacy_submitTrainingForm2682402612", {
      isCertificationPartial: true,
    });
    cy.get("[type=submit]").click();
    cy.wait("@updateCandidacyTraining");
    cy.get("[role=status]").should("contain", "Confirmation");
  });
});
