import { stubMutation, stubQuery } from "../../../../utils/graphql";

function interceptQueries({
  rendezVousPedagogiqueTemporalStatus = "UPCOMING",
}: { rendezVousPedagogiqueTemporalStatus?: "UPCOMING" | "PAST" } = {}) {
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

    stubQuery(req, "getCandidacyAndAppointmentForUpdateOrViewAppointmentPage", {
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
          type: "RENDEZ_VOUS_PEDAGOGIQUE",
          title: "Rendez-vous pédagogique",
          date: "2025-01-01T09:00:00.000Z",
          duration: "ONE_HOUR",
          location: "Test Location",
          description: "Test Description",
          temporalStatus: rendezVousPedagogiqueTemporalStatus,
        },
      },
    });

    stubMutation(req, "updateAppointmentForUpdateAppointmentPage", {
      data: {
        appointment_updateAppointment: {
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
  cy.wait("@getCandidacyAndAppointmentForUpdateOrViewAppointmentPage");
}

context("when I access the candidacy add appointment page", () => {
  context("when the appointment is upcoming", () => {
    it("show the correct title", function () {
      interceptQueries();
      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3",
      );
      waitForQueries();

      cy.get('[data-test="update-appointments-page"]')
        .children("h1")
        .should("have.text", "Rendez-vous pédagogique de Doe John");
    });

    it("fill the field with the existing appointment values", function () {
      interceptQueries();
      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3",
      );
      waitForQueries();

      cy.get('[data-test="title-input"] input').should(
        "have.value",
        "Rendez-vous pédagogique",
      );
      cy.get('[data-test="date-input"] input').should(
        "have.value",
        "2025-01-01",
      );
      cy.get('[data-test="time-input"] input').should("have.value", "10:00");
      cy.get('[data-test="duration-input"] select').should(
        "have.value",
        "ONE_HOUR",
      );
      cy.get('[data-test="location-input"] input').should(
        "have.value",
        "Test Location",
      );
      cy.get('[data-test="description-input"] textarea').should(
        "have.value",
        "Test Description",
      );
    });

    it("does not let me submit a pristine form", function () {
      interceptQueries();
      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3",
      );
      waitForQueries();

      cy.get("button[type='submit']").should("be.disabled");
    });

    it("let me update the field and submit the form", function () {
      interceptQueries();
      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3",
      );
      waitForQueries();

      cy.get('[data-test="title-input"] input').type("Updated Appointment");
      cy.get('[data-test="date-input"] input').type("2027-01-01");
      cy.get('[data-test="time-input"] input').type("18:00");
      cy.get('[data-test="duration-input"] select').select("TWO_HOURS");
      cy.get('[data-test="location-input"] input').type("Updated Location");
      cy.get('[data-test="description-input"] textarea').type(
        "Updated Description",
      );

      cy.get("button[type='submit']").click();

      cy.wait("@updateAppointmentForUpdateAppointmentPage");

      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3/update-confirmation/`,
      );
    });
  });
  context("when the appointment is past", () => {
    it("show the correct title", function () {
      interceptQueries({ rendezVousPedagogiqueTemporalStatus: "PAST" });
      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3",
      );
      waitForQueries();

      cy.get('[data-test="view-appointments-page"]')
        .children("h1")
        .should("have.text", "Rendez-vous pédagogique");
    });

    it("show the correct field values", function () {
      interceptQueries({ rendezVousPedagogiqueTemporalStatus: "PAST" });

      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3",
      );
      waitForQueries();

      cy.get('[data-test="rendez-vous-pedagogique-tile"] .fr-tag').should(
        "have.text",
        "Rendez-vous pédagogique",
      );
      cy.get(
        '[data-test="rendez-vous-pedagogique-tile"] .fr-tile__title',
      ).should("have.text", "01/01/2025 - 10:00");
      cy.get('[data-test="candidate-row"]').should("have.text", "Doe John");
      cy.get('[data-test="duration-row"] ').should("have.text", "1 heure");
      cy.get('[data-test="location-row"]').should("have.text", "Test Location");
      cy.get('[data-test="description-row"]').should(
        "have.text",
        "Test Description",
      );
    });

    it("let me go back to the appointments page when i click on the back button", function () {
      interceptQueries({ rendezVousPedagogiqueTemporalStatus: "PAST" });

      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3",
      );
      waitForQueries();

      cy.get("[data-test='back-button']").click();
      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/`,
      );
    });
  });
});
