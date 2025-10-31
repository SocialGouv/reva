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
  });
}

function waitForQueries() {
  cy.wait("@activeFeaturesForConnectedUser");
  cy.wait("@getMaisonMereCGUQuery");
  cy.wait("@getOrganismForAAPVisibilityCheck");
  cy.wait("@candidacy_canAccessCandidacy");
  cy.wait("@getAccountInfo");
  cy.wait("@getCandidacyMenuAndCandidateInfos");
}

context("when I access the delete appointment confirmation page", () => {
  it("show the correct title and content", function () {
    interceptQueries();
    cy.admin(
      "/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/5e3acd4a-128f-4d1d-b9d7-4a1bd126bdd3/delete-confirmation/?date=2025-01-01T09:00:00.000Z&candidateFirstName=John&candidateLastName=Doe",
    );
    waitForQueries();

    cy.get('[data-testid="appointment-delete-confirmation-page-title"]').should(
      "have.text",
      "Rendez-vous supprimé",
    );
    cy.get('[data-testid="appointment-delete-confirmation-page-date"]').should(
      "have.text",
      "Le 01/01/2025 à 10:00",
    );
    cy.get(
      '[data-testid="appointment-delete-confirmation-page-candidate"]',
    ).should("have.text", "Candidat : Doe John");
  });
});
