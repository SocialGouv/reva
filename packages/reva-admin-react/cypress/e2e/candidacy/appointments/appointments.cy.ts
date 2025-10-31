import { stubQuery } from "../../../utils/graphql";

function interceptQueries(args?: {
  withRendezVousPedagogique?: boolean;
  withPastRendezVousPedagogique?: boolean;
}) {
  const withRendezVousPedagogique = args?.withRendezVousPedagogique;
  const withPastRendezVousPedagogique = args?.withPastRendezVousPedagogique;
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

    stubQuery(req, "getCandidacyAndUpcomingAppointmentsForAppointmentsPage", {
      data: {
        getCandidacyById: {
          id: "fb451fbc-3218-416d-9ac9-65b13432469f",
          appointments: withRendezVousPedagogique
            ? {
                rows: [
                  {
                    id: "6c814f7c-09a0-4621-9a0e-5bf5212696c8",
                    type: "RENDEZ_VOUS_PEDAGOGIQUE",
                    title: "Rendez-vous pédagogique",
                    date: "2225-01-01T09:00:00.000Z",
                    temporalStatus: "UPCOMING",
                  },
                ],
                info: {
                  totalRows: 1,
                  currentPage: 1,
                  totalPages: 1,
                },
              }
            : {
                rows: [],
                info: {
                  totalRows: 0,
                  currentPage: 1,
                  totalPages: 1,
                },
              },
        },
      },
    });
    stubQuery(req, "getCandidacyAndPastAppointmentsForAppointmentsPage", {
      data: {
        getCandidacyById: {
          id: "fb451fbc-3218-416d-9ac9-65b13432469f",
          appointments: withPastRendezVousPedagogique
            ? {
                rows: [
                  {
                    id: "6c814f7c-09a0-4621-9a0e-5bf5212696c8",
                    type: "RENDEZ_VOUS_PEDAGOGIQUE",
                    title: "Rendez-vous pédagogique",
                    date: "2025-01-01T09:00:00.000Z",
                    temporalStatus: "PAST",
                  },
                ],
                info: {
                  totalRows: 1,
                  currentPage: 1,
                  totalPages: 1,
                },
              }
            : {
                rows: [],
                info: {
                  totalRows: 0,
                  currentPage: 1,
                  totalPages: 1,
                },
              },
        },
      },
    });
    stubQuery(req, "getRendezVousPedagogiqueForAppointmentsPage", {
      data: {
        getCandidacyById: {
          id: "fb451fbc-3218-416d-9ac9-65b13432469f",
          appointments:
            withRendezVousPedagogique || withPastRendezVousPedagogique
              ? {
                  rows: [
                    {
                      id: "6c814f7c-09a0-4621-9a0e-5bf5212696c8",
                    },
                  ],
                  info: {
                    totalRows: 1,
                    currentPage: 1,
                    totalPages: 1,
                  },
                }
              : {
                  rows: [],
                  info: {
                    totalRows: 0,
                    currentPage: 1,
                    totalPages: 1,
                  },
                },
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
  cy.wait("@getCandidacyAndUpcomingAppointmentsForAppointmentsPage");
  cy.wait("@getCandidacyAndPastAppointmentsForAppointmentsPage");
  cy.wait("@getRendezVousPedagogiqueForAppointmentsPage");
}

context("when I access the candidacy appointments page", () => {
  it("show the correct title", function () {
    interceptQueries();
    cy.admin("/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/");
    waitForQueries();

    cy.get('[data-testid="appointments-page"]')
      .children("h1")
      .should("have.text", "Gestion des rendez-vous");
  });

  context("when there are appointments", () => {
    it("show the appointments", function () {
      interceptQueries({ withRendezVousPedagogique: true });
      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/",
      );
      waitForQueries();

      cy.get('[data-testid="upcoming-appointments-list"]')
        .children("li")
        .should("have.length", 1);
    });

    it("leads me to the appointment details page when I click on the appointment", function () {
      interceptQueries({ withRendezVousPedagogique: true });
      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/",
      );
      waitForQueries();

      cy.get('[data-testid="upcoming-appointments-list"]')
        .children("li")
        .first()
        .should("not.have.attr", "href");

      cy.get('[data-testid="upcoming-appointments-list"]')
        .children("li")
        .first()
        .click();
      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/6c814f7c-09a0-4621-9a0e-5bf5212696c8/`,
      );
    });

    it("let me click on the 'add appointment' button", function () {
      interceptQueries({ withRendezVousPedagogique: true });
      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/",
      );
      waitForQueries();

      cy.get('[data-testid="add-appointment-button"]').click();
      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/add-appointment/?type=RENDEZ_VOUS_DE_SUIVI`,
      );
    });
  });

  context("when there are no appointment", () => {
    it("disable the 'add appointment' button", function () {
      interceptQueries({ withRendezVousPedagogique: false });
      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/",
      );
      waitForQueries();
      cy.get('[data-testid="add-appointment-button"]').should("be.disabled");
    });

    it("shows the 'add first appointment' card", function () {
      interceptQueries({ withRendezVousPedagogique: false });
      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/",
      );
      waitForQueries();
      cy.get('[data-testid="add-first-appointment-card"]').should("exist");
    });

    it("leads me to the add appointment page when I click on the 'add first appointment' card", function () {
      interceptQueries({ withRendezVousPedagogique: false });
      cy.admin(
        "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/",
      );
      waitForQueries();
      cy.get('[data-testid="add-first-appointment-card"]').click();
      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/add-appointment/?type=RENDEZ_VOUS_PEDAGOGIQUE`,
      );
    });
  });
});
