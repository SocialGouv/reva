import { stubQuery } from "../../../utils/graphql";

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

    stubQuery(req, "getCertificationAuthorityMetabaseUrl", {
      data: { account_getAccountForConnectedUser: null },
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
  cy.wait("@getCertificationAuthorityMetabaseUrl");
}

context("when I access the candidacy appointments page", () => {
  it("show the correct title", function () {
    interceptQueries();
    cy.admin("/candidacies/fb451fbc-3218-416d-9ac9-65b13432469f/appointments/");
    waitForQueries();

    cy.get('[data-test="appointments-page"]')
      .children("h1")
      .should("have.text", "Gestion des rendez-vous");
  });
});
