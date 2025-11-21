import { stubMutation, stubQuery } from "../../../utils/graphql";

import candidacyWithCandidateContactDetails from "./fixtures/candidacy-with-candidate-contact-details.json";

function interceptQueries() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "getCandidateContactDetails",
      candidacyWithCandidateContactDetails,
    );
    stubQuery(req, "activeFeaturesForConnectedUser", {
      data: {
        activeFeaturesForConnectedUser: [],
      },
    });

    stubQuery(req, "getAccountInfo", "account/admin-info.json");
    stubQuery(
      req,
      "getCandidacyMenuAndCandidateInfos",
      "candidacy/candidacy-menu.json",
    );
    stubQuery(
      req,
      "getMaisonMereCGUQuery",
      "account/gestionnaire-cgu-accepted.json",
    );
  });
}

function interceptUpdateCandidateContactDetailsMutation() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubMutation(
      req,
      "updateCandidateContactDetailsForCandidateContactDetailsPage",
      {
        data: {
          candidate_updateCandidateContactDetails: {
            id: "fb451fbc-3218-416d-9ac9-65b13432469f",
            phone: "1111111111",
            email: "mynewemail@example.com",
          },
        },
      },
    );
  });
}

context("Candidate contact details", () => {
  it("should display the candidate contact details page with the candidate phone and email ", function () {
    interceptQueries();
    cy.collaborateur(
      Cypress.config().baseUrl +
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/summary/candidate-contact-details/",
    );

    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getAccountInfo");
    cy.wait("@getCandidacyMenuAndCandidateInfos");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCandidateContactDetails");
    cy.get("h1").should("contain", "Coordonnées du candidat");
    cy.get('[data-testid="phone-input"] input').should(
      "have.value",
      "0600000000",
    );
    cy.get('[data-testid="email-input"] input').should(
      "have.value",
      "jane.doe@example.com",
    );
  });

  it("should go back to the candidacy summary page when i click on the back button ", function () {
    interceptQueries();
    cy.collaborateur(
      Cypress.config().baseUrl +
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/summary/candidate-contact-details/",
    );

    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getAccountInfo");
    cy.wait("@getCandidacyMenuAndCandidateInfos");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCandidateContactDetails");

    cy.get('[data-testid="back-button"]').click();
    cy.url().should(
      "eq",
      Cypress.config().baseUrl +
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/summary/",
    );
  });

  it("should let me update the form, submit it and rediredct me to the candidacy summary page", function () {
    interceptQueries();
    interceptUpdateCandidateContactDetailsMutation();

    cy.admin(
      Cypress.config().baseUrl +
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/summary/candidate-contact-details/",
    );

    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getAccountInfo");
    cy.wait("@getCandidacyMenuAndCandidateInfos");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCandidateContactDetails");

    cy.get('[data-testid="phone-input"] input').clear().type("1111111111");
    cy.get('[data-testid="email-input"] input')
      .clear()
      .type("mynewemail@example.com");

    cy.get('button[type="submit"]').click();

    cy.wait("@updateCandidateContactDetailsForCandidateContactDetailsPage");

    cy.url().should(
      "eq",
      Cypress.config().baseUrl +
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/summary/",
    );
  });

  it("should disable the email button if i'm not an admin", function () {
    interceptQueries();
    interceptUpdateCandidateContactDetailsMutation();

    cy.collaborateur(
      Cypress.config().baseUrl +
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/summary/candidate-contact-details/",
    );

    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getAccountInfo");
    cy.wait("@getCandidacyMenuAndCandidateInfos");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCandidateContactDetails");

    cy.get('[data-testid="email-input"] input').should("be.disabled");
  });
});
