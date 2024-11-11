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
    stubQuery(req, "getCertificationsForListPage", certifications);
  });
}

context("when i access the certification list", () => {
  it("display a list of 3 certifications", function () {
    interceptCertifications();

    cy.admin("/certifications-v2");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsForListPage");
    cy.get('[data-test="results"]').children().should("have.length", 3);
  });

  it("let me click on the 'add certification' button", function () {
    interceptCertifications();

    cy.admin("/certifications-v2");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsForListPage");
    cy.get('[data-test="add-certification-button"]').click();
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/certifications-v2/add-certification/",
    );
  });

  it("let me click on the 'access certification' button", function () {
    interceptCertifications();

    cy.admin("/certifications-v2");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsForListPage");
    cy.get('[data-test="access-certification-button"]').eq(1).click();
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/certifications-v2/654c9471-6e2e-4ff2-a5d8-2069e78ea0d6/",
    );
  });
});
