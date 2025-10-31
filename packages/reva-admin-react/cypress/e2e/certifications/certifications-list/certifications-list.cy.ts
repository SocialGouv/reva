import { stubQuery } from "../../../utils/graphql";

import certifications from "./fixtures/certifications.json";

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
    stubQuery(req, "getCertificationsV2ForListPage", certifications);
  });
}

context("when i access the certification list", () => {
  it("display a list of 3 certifications", function () {
    interceptCertifications();

    cy.admin("/certifications");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForListPage");
    cy.get('[data-testid="results"]').children().should("have.length", 3);
  });

  it("let me click on the 'add certification' button", function () {
    interceptCertifications();

    cy.admin("/certifications");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForListPage");
    cy.get('[data-testid="add-certification-button"]').click();
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/certifications/add-certification/",
    );
  });

  it("let me click on the 'access certification' button", function () {
    interceptCertifications();

    cy.admin("/certifications");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForListPage");
    cy.get('[data-testid="access-certification-button"]').eq(1).click();
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/certifications/654c9471-6e2e-4ff2-a5d8-2069e78ea0d6/",
    );
  });
});
