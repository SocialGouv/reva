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

    it("should show the certification selected on the sidebar", () => {
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
    });

    it("should let navigation to the account registration form on step 2", () => {
      cy.visit(
        "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0",
      );

      cy.wait("@getCertification");

      cy.get(
        '[data-testid="candidate-registration-form-accompagne-tile"]',
      ).should("be.visible");
      cy.get(
        '[data-testid="candidate-registration-form-autonome-tile"]',
      ).should("be.visible");

      cy.get(
        '[data-testid="candidate-registration-form-accompagne-tile"]',
      ).click();

      cy.get('[data-testid="candidate-registration-form"]').should("exist");
    });

    it("should navigate to confirmation page after submitting form", () => {
      cy.visit(
        "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0",
      );

      cy.wait("@getCertification");

      cy.get(
        '[data-testid="candidate-registration-form-autonome-tile"]',
      ).click();

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
      cy.get(
        '[data-testid="candidate-registration-form-autonome-tile"]',
      ).click();

      cy.get('[data-testid="registration-disabled-error"]').should(
        "be.visible",
      );
    });
  });
});
