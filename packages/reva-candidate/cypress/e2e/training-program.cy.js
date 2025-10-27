import candidate1Data from "../fixtures/candidate1.json";
import { stubQuery } from "../utils/graphql";

context("Training Program", () => {
  describe("Testing descriptions", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "candidate_getCandidateForCandidatesGuard",
          "candidate1-for-candidates-guard.json",
        );
        stubQuery(req, "getCandidateByIdForCandidateGuard", candidate1Data);
        stubQuery(
          req,
          "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
          "candidacies-with-candidacy-2.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForCandidacyGuard",
          "candidacy2-training-confirmed.json",
        );
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
        stubQuery(
          req,
          "getCandidacyByIdWithCandidate",
          "candidacy2-training-confirmed.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForDashboard",
          "candidacy2-training-confirmed.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForValidateTraining",
          "candidacy2-training-confirmed.json",
        );
      });
      cy.login();

      cy.wait([
        "@candidate_getCandidateForCandidatesGuard",
        "@getCandidateByIdForCandidateGuard",
        "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
        "@activeFeaturesForConnectedUser",
        "@getCandidacyByIdForCandidacyGuard",
        "@getCandidacyByIdWithCandidate",
        "@getCandidacyByIdForDashboard",
      ]);

      cy.get('[data-testid="training-tile"] button').click();
      cy.wait("@getCandidacyByIdForValidateTraining");
    });

    it("display all fields", () => {
      cy.get('[data-testid="general-informations"]')
        .children("li")
        .should("have.length", 3);

      cy.get('[data-testid="mandatory-training-section"]')
        .children("ul")
        .children("li")
        .should("have.length", 3);

      cy.get('[data-testid="basic-skills-section"]')
        .children("ul")
        .children("li")
        .should("have.length", 2);

      cy.get('[data-testid="certificate-skills-section"]')
        .children("p")
        .should("have.text", "Blocs de compétences métier");

      cy.get('[data-testid="other-training-section"]')
        .children("p")
        .should("have.text", "Autres actions de formations complémentaires");
    });
  });

  describe("Testing descriptions with missing fields", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "candidate_getCandidateForCandidatesGuard",
          "candidate1-for-candidates-guard.json",
        );
        stubQuery(req, "getCandidateByIdForCandidateGuard", candidate1Data);
        stubQuery(
          req,
          "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
          "candidacies-with-candidacy-2.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForCandidacyGuard",
          "candidacy2-missing-training-fields.json",
        );
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
        stubQuery(
          req,
          "getCandidacyByIdWithCandidate",
          "candidacy2-missing-training-fields.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForDashboard",
          "candidacy2-missing-training-fields.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForValidateTraining",
          "candidacy2-missing-training-fields.json",
        );
      });
      cy.login();

      cy.wait([
        "@candidate_getCandidateForCandidatesGuard",
        "@getCandidateByIdForCandidateGuard",
        "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
        "@activeFeaturesForConnectedUser",
        "@getCandidacyByIdForCandidacyGuard",
        "@getCandidacyByIdWithCandidate",
        "@getCandidacyByIdForDashboard",
      ]);

      cy.get('[data-testid="training-tile"] button').click();
      cy.wait("@getCandidacyByIdForValidateTraining");
    });

    it("don't display missing fields", () => {
      cy.get('[data-testid="general-informations"]')
        .children("li")
        .should("have.length", 3);

      cy.get('[data-testid="mandatory-training-section"]').should("not.exist");

      cy.get('[data-testid="basic-skills-section"]').should("not.exist");

      cy.get('[data-testid="certificate-skills-section"]')
        .children("p")
        .should("have.text", "Blocs de compétences métier");

      cy.get('[data-testid="other-training-section"]')
        .children("p")
        .should("have.text", "Autres actions de formations complémentaires");
    });
  });

  describe("Testing Checkbox logic", () => {
    it("validates checked condition and its mechanics", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "candidate_getCandidateForCandidatesGuard",
          "candidate1-for-candidates-guard.json",
        );
        stubQuery(req, "getCandidateByIdForCandidateGuard", candidate1Data);
        stubQuery(
          req,
          "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
          "candidacies-with-candidacy-2.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForCandidacyGuard",
          "candidacy2-training-sent.json",
        );
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
        stubQuery(
          req,
          "getCandidacyByIdWithCandidate",
          "candidacy2-training-sent.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForDashboard",
          "candidacy2-training-sent.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForValidateTraining",
          "candidacy2-training-sent.json",
        );
        stubQuery(
          req,
          "training_confirmTrainingForm",
          "confirm-training-form.json",
        );
      });
      cy.login();

      cy.wait([
        "@candidate_getCandidateForCandidatesGuard",
        "@getCandidateByIdForCandidateGuard",
        "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
        "@activeFeaturesForConnectedUser",
        "@getCandidacyByIdForCandidacyGuard",
        "@getCandidacyByIdWithCandidate",
        "@getCandidacyByIdForDashboard",
      ]);

      cy.get('[data-testid="training-tile"] button').click();
      cy.wait("@getCandidacyByIdForValidateTraining");

      cy.get('[data-testid="accept-conditions-checkbox-group"]')
        .find("input")
        .not("be.checked");

      cy.get('[data-testid="submit-training-program-button"]').should(
        "be.disabled",
      );

      cy.get('[data-testid="accept-conditions-checkbox-group"]')
        .find("label")
        .click({ multiple: true });

      cy.get('[data-testid="submit-training-program-button"]')
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
          "candidate_getCandidateForCandidatesGuard",
          "candidate1-for-candidates-guard.json",
        );
        stubQuery(req, "getCandidateByIdForCandidateGuard", candidate1Data);
        stubQuery(
          req,
          "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
          "candidacies-with-candidacy-2.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForCandidacyGuard",
          "candidacy2-training-confirmed-sent-again.json",
        );
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
        stubQuery(
          req,
          "getCandidacyByIdWithCandidate",
          "candidacy2-training-confirmed-sent-again.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForDashboard",
          "candidacy2-training-confirmed-sent-again.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForValidateTraining",
          "candidacy2-training-confirmed-sent-again.json",
        );
        stubQuery(
          req,
          "training_confirmTrainingForm",
          "confirm-training-form.json",
        );
      });
      cy.login();

      cy.wait([
        "@candidate_getCandidateForCandidatesGuard",
        "@getCandidateByIdForCandidateGuard",
        "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
        "@activeFeaturesForConnectedUser",
        "@getCandidacyByIdForCandidacyGuard",
        "@getCandidacyByIdWithCandidate",
        "@getCandidacyByIdForDashboard",
      ]);

      cy.get('[data-testid="training-tile"] button').click();
      cy.wait("@getCandidacyByIdForValidateTraining");

      cy.get('[data-testid="accept-conditions-checkbox-group"]')
        .find("input")
        .not("be.checked");

      cy.get('[data-testid="submit-training-program-button"]').should(
        "be.disabled",
      );
      cy.get('[data-testid="accept-conditions-checkbox-group"]')
        .find("label")
        .click({ multiple: true });

      cy.get('[data-testid="submit-training-program-button"]')
        .should("not.be.disabled")
        .click();
      cy.wait("@training_confirmTrainingForm");
    });
  });
});
