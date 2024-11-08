import { stubQuery } from "../../../utils/graphql";

function interceptCertifications() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "activeFeaturesForConnectedUser",
      "features/active-features.json",
    );
    stubQuery(req, "getOrganismForAAPVisibilityCheck", "visibility/admin.json");
    stubQuery(
      req,
      "getMaisonMereCGUQuery",
      "account/gestionnaire-cgu-accepted.json",
    );
  });
}

context("when i access the add certification page ", () => {
  it("display the page with a correct title", function () {
    interceptCertifications();

    cy.admin("/certifications-v2/add-certification");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.get('[data-test="add-certification-page"]')
      .children("h1")
      .should("have.text", "Ajout d'une certification");
  });

  it("let me click on the certification description card complete button button", function () {
    interceptCertifications();

    cy.admin("/certifications-v2/add-certification");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.get('[data-test="certification-description-card"] button').click();
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/certifications-v2/add-certification/description/",
    );
  });
});
