import { stubQuery } from "../utils/graphql";

context("Training Program", () => {
  describe("Testing descriptions", () => {
    beforeEach(() => {
      cy.intercept("POST", "/graphql", (req) => {
        stubQuery(
          req,
          "candidate_confirmRegistration",
          "candidate2-training-confirmed.json"
        );
      });
      cy.visit("/login?token=abc");
      cy.wait("@candidate_confirmRegistration");

      cy.get('[data-test="progress-title-value"]').should("have.text", "100%");
      cy.get('[data-test="progress-100"]').should("exist");
      cy.get('[data-test="review-training-form"]').should("exist");
      cy.get('[data-test="ap-organism"]').should("exist");

      cy.get('[data-test="review-button"]').click();
    });

    it("display all fields", () => {
      cy.get('[data-test="description-list"]').should("have.length", 1);
      cy.get('[data-test="description-term"]').should("have.length", 8);
      cy.get('[data-test="description-details"]').should("have.length", 8);
    });
  });

  describe("Testing descriptions with missing fields", () => {
    beforeEach(() => {
      cy.intercept("POST", "/graphql", (req) => {
        stubQuery(
          req,
          "candidate_confirmRegistration",
          "candidate2-missing-training-fields.json"
        );
      });
      cy.visit("/login?token=abc");
      cy.wait("@candidate_confirmRegistration");
      cy.get('[data-test="review-button"]').click();
    });

    it("don't display missing fields", () => {
      cy.get('[data-test="description-list"]').should("have.length", 1);
      cy.get('[data-test="description-term"]').should("have.length", 4);
      cy.get('[data-test="description-details"]').should("have.length", 4);
    });
  });

  describe("Testing Checkbox logic", () => {
    it("validates checked condition and its mechanics", () => {
      cy.intercept("POST", "/graphql", (req) => {
        stubQuery(
          req,
          "candidate_confirmRegistration",
          "candidate2-training-sent.json"
        );

        stubQuery(
          req,
          "candidacy_confirmTrainingForm",
          "confirm-training-form.json"
        );
      });
      cy.visit("/login?token=abc");
      cy.wait("@candidate_confirmRegistration");

      cy.get('[data-test="checkbox-accept-conditions"]').not("be.checked");
      cy.get('[data-test="label-accept-conditions"]').should("exist");
      cy.get('[data-test="submit-training"]').should("be.disabled");
      cy.get('[data-test="checkbox-accept-conditions"]').check();
      cy.get('[data-test="submit-training"]').should("be.enabled").click();
      cy.wait("@candidacy_confirmTrainingForm");
    });
  });
});
