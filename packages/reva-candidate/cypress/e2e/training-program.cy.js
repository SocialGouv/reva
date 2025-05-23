import { stubQuery } from "../utils/graphql";

context("Training Program", () => {
  describe("Testing descriptions", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "candidate_getCandidateWithCandidacy",
          "candidate2-training-confirmed.json",
        );
        stubQuery(
          req,
          "getCandidateWithCandidacyForTrainingValidation",
          "candidate2-training-confirmed.json",
        );
        stubQuery(
          req,
          "candidate_getCandidateWithCandidacyForDashboard",
          "candidate2-training-confirmed.json",
        );
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      });
      cy.login();

      cy.wait("@candidate_getCandidateWithCandidacy");
      cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

      cy.get('[data-test="training-tile"] button').click();
      cy.wait("@getCandidateWithCandidacyForTrainingValidation");
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
        stubQuery(
          req,
          "candidate_getCandidateWithCandidacy",
          "candidate2-missing-training-fields.json",
        );
        stubQuery(
          req,
          "getCandidateWithCandidacyForTrainingValidation",
          "candidate2-missing-training-fields.json",
        );
        stubQuery(
          req,
          "candidate_getCandidateWithCandidacyForDashboard",
          "candidate2-missing-training-fields.json",
        );
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      });
      cy.login();

      cy.wait("@candidate_getCandidateWithCandidacy");
      cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

      cy.get('[data-test="training-tile"] button').click();
      cy.wait("@getCandidateWithCandidacyForTrainingValidation");
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
        stubQuery(
          req,
          "candidate_getCandidateWithCandidacy",
          "candidate2-training-sent.json",
        );
        stubQuery(
          req,
          "getCandidateWithCandidacyForTrainingValidation",
          "candidate2-training-sent.json",
        );
        stubQuery(
          req,
          "training_confirmTrainingForm",
          "confirm-training-form.json",
        );
        stubQuery(
          req,
          "candidate_getCandidateWithCandidacyForDashboard",
          "candidate2-training-sent.json",
        );
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      });
      cy.login();

      cy.wait("@candidate_getCandidateWithCandidacy");
      cy.wait("@candidate_getCandidateWithCandidacyForDashboard");
      cy.get('[data-test="training-tile"] button').click();
      cy.wait("@getCandidateWithCandidacyForTrainingValidation");

      cy.get('[data-test="accept-conditions-checkbox-group"]')
        .find("input")
        .not("be.checked");

      cy.get('[data-test="submit-training-program-button"]').should(
        "be.disabled",
      );

      cy.get('[data-test="accept-conditions-checkbox-group"]')
        .find("label")
        .click({ multiple: true });

      cy.get('[data-test="submit-training-program-button"]')
        .should("not.be.disabled")
        .click();

      cy.wait("@training_confirmTrainingForm");
    });
  });

  describe("Testing training confirmed but sent again", () => {
    it("should be able to accept and submit the training again", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "candidate_getCandidateWithCandidacy",
          "candidate2-training-confirmed-sent-again.json",
        );
        stubQuery(
          req,
          "getCandidateWithCandidacyForTrainingValidation",
          "candidate2-training-confirmed-sent-again.json",
        );
        stubQuery(
          req,
          "training_confirmTrainingForm",
          "confirm-training-form.json",
        );
        stubQuery(
          req,
          "candidate_getCandidateWithCandidacyForDashboard",
          "candidate2-training-confirmed-sent-again.json",
        );
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      });
      cy.login();

      cy.wait("@candidate_getCandidateWithCandidacy");
      cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

      cy.get('[data-test="training-tile"] button').click();
      cy.wait("@getCandidateWithCandidacyForTrainingValidation");

      cy.get('[data-test="accept-conditions-checkbox-group"]')
        .find("input")
        .not("be.checked");

      cy.get('[data-test="submit-training-program-button"]').should(
        "be.disabled",
      );
      cy.get('[data-test="accept-conditions-checkbox-group"]')
        .find("label")
        .click({ multiple: true });

      cy.get('[data-test="submit-training-program-button"]')
        .should("not.be.disabled")
        .click();
      cy.wait("@training_confirmTrainingForm");
    });
  });
});
