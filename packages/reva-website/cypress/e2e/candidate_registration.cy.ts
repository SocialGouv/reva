import { stubMutation, stubQuery } from "../support/graphql";

describe("candidate two-steps registration", () => {
  context("candidate registration enabled", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: {
            activeFeaturesForConnectedUser: ["CANDIDATE_REGISTRATION_V2"],
          },
        });
        stubQuery(
          req,
          "getCertification",
          "certification_bts_chaudronnier.json",
        );
        stubQuery(
          req,
          "getDepartments",
          "candidate_registration_departments.json",
        );
        stubMutation(
          req,
          "candidate_askForRegistration",
          "candidate_registration_candidate_ask_for_registration.json",
        );
      });
    });

    it("should show the certification selected on the sidebar and the modalite inconnu tag", () => {
      cy.visit(
        "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0",
      );

      cy.get('[data-testid="selected-certification-label"]').should(
        "have.text",
        "BTS Chaudronnier",
      );
      cy.get('[data-testid="selected-certification-code-rncp"]').should(
        "have.text",
        "12345",
      );

      cy.get('[data-testid="tag-modalite-inconnue"]').should("be.visible");
      cy.get('[data-testid="tag-accompagne"]').should("not.exist");
      cy.get('[data-testid="tag-autonome"]').should("not.exist");
    });

    it("should show the correct modalite tag after selecting 'accompagne'", () => {
      cy.visit(
        "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0",
      );

      cy.wait("@getCertification");

      cy.get('[data-testid="tag-modalite-inconnue"]').should("be.visible");

      cy.get('[data-testid="tile-accompagne"]').click();

      cy.get('[data-testid="tag-modalite-inconnue"]').should("not.exist");
      cy.get('[data-testid="tag-accompagne"]').should("be.visible");
      cy.get('[data-testid="tag-autonome"]').should("not.exist");
    });

    it("should show the correct accompaniment tag after selecting 'autonome'", () => {
      cy.visit(
        "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0",
      );

      cy.wait("@getCertification");

      cy.get('[data-testid="tag-modalite-inconnue"]').should("be.visible");

      cy.get('[data-testid="tile-autonome"]').click();

      cy.get('[data-testid="tag-modalite-inconnue"]').should("not.exist");
      cy.get('[data-testid="tag-autonome"]').should("be.visible");
      cy.get('[data-testid="tag-accompagne"]').should("not.exist");
    });

    it("should let navigation to the account registration form on step 2", () => {
      cy.visit(
        "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0",
      );

      cy.wait("@getCertification");

      cy.get('[data-testid="tile-accompagne"]').should("be.visible");
      cy.get('[data-testid="tile-autonome"]').should("be.visible");

      cy.get('[data-testid="tile-accompagne"]').click();

      cy.get('[data-testid="candidate-registration-form"]').should("exist");
    });

    it("should navigate to confirmation page after submitting form", () => {
      cy.visit(
        "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0",
      );

      cy.wait("@getCertification");

      cy.get('[data-testid="tile-autonome"]').click();

      cy.wait("@getDepartments");

      cy.get(
        '[data-testid="candidate-registration-form-firstname-input"]',
      ).type("Alice");

      cy.get('[data-testid="candidate-registration-form-lastname-input"]').type(
        "Doe",
      );

      cy.get('[data-testid="candidate-registration-form-phone-input"]').type(
        "+33 1 01 01 01 01",
      );

      cy.get('[data-testid="candidate-registration-form-email-input"]')
        .children("input")
        .type("alice.doe@example.com");

      cy.get('[data-testid="candidate-registration-form-department-select"]')
        .children("select")
        .select("department1");

      cy.get('[data-testid="candidate-registration-submit-button"]').click();

      cy.wait("@candidate_askForRegistration");

      cy.url().should(
        "eq",
        "http://localhost:3002/inscription-candidat/confirmation/",
      );
    });
  });

  context("candidate registration disabled", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "getCertification",
          "certification_bts_chaudronnier.json",
        );
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: {
            activeFeaturesForConnectedUser: [
              "CANDIDACY_CREATION_DISABLED",
              "CANDIDATE_REGISTRATION_V2",
            ],
          },
        });
      });

      cy.visit(
        "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0",
      );
    });

    it("should show an error message on step 2", () => {
      cy.wait("@getCertification");
      cy.get('[data-testid="tile-autonome"]').click();

      cy.get('[data-testid="registration-disabled-error"]').should(
        "be.visible",
      );
    });
  });
});
