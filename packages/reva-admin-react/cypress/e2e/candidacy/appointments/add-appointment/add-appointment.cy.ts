import { stubMutation, stubQuery } from "../../../../utils/graphql";

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

    stubQuery(req, "getCandidacyForAddAppointmentPage", {
      data: {
        getCandidacyById: {
          id: "fb451fbc-3218-416d-9ac9-65b13432469f",
          candidate: {
            id: "6c814f7c-09a0-4621-9a0e-5bf5212696c8",
            firstname: "John",
            lastname: "Doe",
          },
        },
      },
    });

    stubMutation(req, "createAppointmentForAddAppointmentPage", {
      data: {
        appointment_createAppointment: {
          id: "5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3",
        },
      },
    });
  });
}

function waitForQueries() {
  cy.wait("@activeFeaturesForConnectedUser");
  cy.wait("@getMaisonMereCGUQuery");
  cy.wait("@getOrganismForAAPVisibilityCheck");
  cy.wait("@candidacy_canAccessCandidacy");
  cy.wait("@getAccountInfo");
  cy.wait("@getCandidacyMenuAndCandidateInfos");
  cy.wait("@getCandidacyForAddAppointmentPage");
}

context("when I access the candidacy add appointment page", () => {
  it("show the correct page title", function () {
    interceptQueries();
    cy.admin(
      "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/add-appointment/?type=RENDEZ_VOUS_PEDAGOGIQUE",
    );
    waitForQueries();

    cy.get('[data-testid="add-appointments-page"]')
      .children("h1")
      .should("have.text", "Rendez-vous pédagogique de Doe John");
  });

  it("show the correct form title", function () {
    interceptQueries();
    cy.admin(
      "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/add-appointment/?type=RENDEZ_VOUS_PEDAGOGIQUE",
    );
    waitForQueries();

    cy.get('[data-testid="title-input"] input').should(
      "have.value",
      "Rendez-vous pédagogique",
    );
  });
});

context("when I try to validate the form ", () => {
  it("does not submit the form without a title, date and time", function () {
    interceptQueries();
    cy.admin(
      "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/add-appointment/?type=RENDEZ_VOUS_DE_SUIVI",
    );
    waitForQueries();

    cy.get('[data-testid="title-input"] input').clear();

    cy.get("button[type='submit']").click();
    cy.get('[data-testid="title-input"]').should(
      "have.class",
      "fr-input-group--error",
    );
    cy.get('[data-testid="date-input"]').should(
      "have.class",
      "fr-input-group--error",
    );
    cy.get('[data-testid="time-input"]').should(
      "have.class",
      "fr-input-group--error",
    );
  });

  it("does not submit the form when the date is in the past", function () {
    interceptQueries();
    cy.admin(
      "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/add-appointment/?type=RENDEZ_VOUS_DE_SUIVI",
    );
    waitForQueries();

    cy.get('[data-testid="title-input"] input').type("Test Appointment");
    cy.get('[data-testid="date-input"] input').type("2005-01-01");
    cy.get('[data-testid="time-input"] input').type("10:00");

    cy.get("button[type='submit']").click();

    cy.get('[data-testid="date-input"]').should(
      "have.class",
      "fr-input-group--error",
    );
  });

  it("does submit the form with a correct title, date and time and redirect me to the appointment update confirmation page", function () {
    interceptQueries();
    cy.admin(
      "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/add-appointment/?type=RENDEZ_VOUS_DE_SUIVI",
    );
    waitForQueries();

    cy.get('[data-testid="title-input"] input').type("Test Appointment");
    cy.get('[data-testid="date-input"] input').type("2225-01-01");
    cy.get('[data-testid="time-input"] input').type("10:00");

    cy.get("button[type='submit']").click();

    cy.get("#send-email-to-candidate-modal-button").click();

    cy.wait("@createAppointmentForAddAppointmentPage");

    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3/update-confirmation/`,
    );
  });

  it("does submit the form with a correct title, date, and all other infos and redirect me to the appointment update confirmation page", function () {
    interceptQueries();
    cy.admin(
      "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/add-appointment/?type=RENDEZ_VOUS_DE_SUIVI",
    );
    waitForQueries();

    cy.get('[data-testid="title-input"] input')
      .clear()
      .type("Test Appointment");
    cy.get('[data-testid="date-input"] input').type("2225-01-01");
    cy.get('[data-testid="time-input"] input').type("10:00");
    cy.get('[data-testid="duration-input"] select').select("ONE_HOUR");
    cy.get('[data-testid="location-input"] input').type("Test Location");
    cy.get('[data-testid="description-input"] textarea').type(
      "Test Description",
    );

    cy.get("button[type='submit']").click();

    cy.get("#send-email-to-candidate-modal-button").click();

    cy.wait("@createAppointmentForAddAppointmentPage");

    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3/update-confirmation/`,
    );
  });
});
