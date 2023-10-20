import { stubMutation, stubQuery } from "../utils/graphql";

context("Training Program", () => {
  describe("Testing descriptions", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "getDepartments", "departments.json");
        stubMutation(
          req,
          "candidate_login",
          "candidate2-training-confirmed.json"
        );
        stubQuery(req, "getReferential", "referential.json");
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      });
      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@getReferential");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.get('[data-test="view-training-program-button"]').click();
    });

    it("display all fields", () => {
      cy.get('[data-test="general-informations"]')
        .children("li")
        .should("have.length", 3);

      cy.get('[data-test="mandatory-training-section"]')
        .children("ul")
        .children("li")
        .should("have.length", 3);

      cy.get('[data-test="basic-skills-section"]')
        .children("ul")
        .children("li")
        .should("have.length", 2);

      cy.get('[data-test="certificate-skills-section"]')
        .children("p")
        .should("have.text", "Blocs de compétences métier");

      cy.get('[data-test="other-training-section"]')
        .children("p")
        .should("have.text", "Autres actions de formations complémentaires");
    });
  });

  describe("Testing descriptions with missing fields", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "getDepartments", "departments.json");
        stubQuery(
          req,
          "candidate_login",
          "candidate2-missing-training-fields.json"
        );
        stubQuery(req, "getReferential", "referential.json");
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      });
      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@getReferential");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.get('[data-test="view-training-program-button"]').click();
    });

    it("don't display missing fields", () => {
      cy.get('[data-test="general-informations"]')
        .children("li")
        .should("have.length", 3);

      cy.get('[data-test="mandatory-training-section"]').should("not.exist");

      cy.get('[data-test="basic-skills-section"]').should("not.exist");

      cy.get('[data-test="certificate-skills-section"]')
        .children("p")
        .should("have.text", "Blocs de compétences métier");

      cy.get('[data-test="other-training-section"]')
        .children("p")
        .should("have.text", "Autres actions de formations complémentaires");
    });
  });

  describe("Testing Checkbox logic", () => {
    it("validates checked condition and its mechanics", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "getDepartments", "departments.json");
        stubMutation(req, "candidate_login", "candidate2-training-sent.json");
        stubQuery(req, "getReferential", "referential.json");
        stubQuery(
          req,
          "candidacy_confirmTrainingForm",
          "confirm-training-form.json"
        );
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      });
      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@getReferential");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.get('[data-test="validate-training-program-button"]').click();

      cy.get('[data-test="accept-conditions-checkbox-group"]')
        .find("input")
        .not("be.checked");

      cy.get('[data-test="submit-training-program-button"]').should(
        "be.disabled"
      );

      cy.get('[data-test="accept-conditions-checkbox-group"]')
        .find("label")
        .click({ multiple: true });

      cy.get('[data-test="submit-training-program-button"]')
        .should("be.enabled")
        .click();

      cy.wait("@candidacy_confirmTrainingForm");
    });
  });

  describe("Testing training confirmed but sent again", () => {
    it("should be able to accept and submit the training again", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "getDepartments", "departments.json");
        stubMutation(
          req,
          "candidate_login",
          "candidate2-training-confirmed-sent-again.json"
        );
        stubQuery(req, "getReferential", "referential.json");
        stubQuery(
          req,
          "candidacy_confirmTrainingForm",
          "confirm-training-form.json"
        );
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      });
      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@getReferential");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.get('[data-test="validate-training-program-button"]').click();

      cy.get('[data-test="accept-conditions-checkbox-group"]')
        .find("input")
        .not("be.checked");

      cy.get('[data-test="submit-training-program-button"]').should(
        "be.disabled"
      );
      cy.get('[data-test="accept-conditions-checkbox-group"]')
        .find("label")
        .click({ multiple: true });

      cy.get('[data-test="submit-training-program-button"]')
        .should("be.enabled")
        .click();
      cy.wait("@candidacy_confirmTrainingForm");
    });
  });
});
