import { stubQuery } from "../../../../../utils/graphql";

function interceptQueries() {
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
    stubQuery(req, "getOrganismForAAPVisibilityCheck", "visibility/admin.json");
    stubQuery(req, "getAccountInfo", "account/admin-info.json");
    stubQuery(
      req,
      "getCandidacyMenuAndCandidateInfos",
      "candidacy/candidacy-menu.json",
    );
    stubQuery(req, "candidacy_canAccessCandidacy", {
      data: { candidacy_canAccessCandidacy: true },
    });

    stubQuery(
      req,
      "getCandidacyAndAppointmentForAppointmentUpdateConfirmationPage",
      {
        data: {
          getCandidacyById: {
            id: "fb451fbc-3218-416d-9ac9-65b13432469f",
            candidate: {
              id: "6c814f7c-09a0-4621-9a0e-5bf5212696c8",
              firstname: "John",
              lastname: "Doe",
            },
          },
          appointment_getAppointmentById: {
            id: "5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3",
            title: "Rendez-vous pédagogique",
            date: "2025-01-01",
            time: "10:00:00.000Z",
          },
        },
      },
    );
  });
}

function waitForQueries() {
  cy.wait("@activeFeaturesForConnectedUser");
  cy.wait("@getMaisonMereCGUQuery");
  cy.wait("@getOrganismForAAPVisibilityCheck");
  cy.wait("@candidacy_canAccessCandidacy");
  cy.wait("@getAccountInfo");
  cy.wait("@getCandidacyMenuAndCandidateInfos");
  cy.wait("@getCandidacyAndAppointmentForAppointmentUpdateConfirmationPage");
}

context("when I access the update appointment confirmation page", () => {
  it("show the correct title", function () {
    interceptQueries();
    cy.admin(
      "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3/update-confirmation",
    );
    waitForQueries();

    cy.get('[data-test="appointment-update-confirmation-page-title"]').should(
      "have.text",
      "Rendez-vous enregistré",
    );
  });

  it("let me click on the 'Gestion des rendez-vous' button and redirect me to the appointments page", function () {
    interceptQueries();
    cy.admin(
      "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3/update-confirmation",
    );
    waitForQueries();

    cy.get(
      '[data-test="appointment-update-confirmation-page-go-back-to-appointments-button"]',
    ).click();
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/`,
    );
  });
});
