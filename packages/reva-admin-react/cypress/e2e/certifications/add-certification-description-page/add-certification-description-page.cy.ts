import { stubMutation, stubQuery } from "../../../utils/graphql";

import addCertificationRncp3890 from "./fixtures/add-fc-certification-rnc-3890.json";
import getCertificationRncp3890 from "./fixtures/get-fc-certification-rnc-3890.json";

function interceptCertification() {
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

function interceptGetFCCertificationQuery() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "getFCCertificationForAddCertificationPage",
      getCertificationRncp3890,
    );
  });
}

function interceptAddFCCertificationMutation() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubMutation(
      req,
      "addFCCertificationForAddCertificationPage",
      addCertificationRncp3890,
    );
  });
}

context("when i access the add certification description page ", () => {
  it("display the page with a correct title", function () {
    interceptCertification();

    cy.admin("/certifications/add-certification/description");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");

    cy.get('[data-testid="add-fc-certification-page"]')
      .children("h1")
      .should("have.text", "Descriptif de la certification");
  });

  it("should focus on rncp code input when submit form with empty code", function () {
    interceptCertification();

    cy.admin("/certifications/add-certification/description");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");

    cy.get("button").contains("Enregistrer").click();

    cy.get('[data-testid="fc-certification-description-input"]')
      .children("input")
      .should("have.focus");
  });

  it("should render fc certification based on rncp code", function () {
    interceptCertification();
    interceptGetFCCertificationQuery();

    cy.admin("/certifications/add-certification/description");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");

    cy.get('[data-testid="fc-certification-description-input"]')
      .children("input")
      .type("3890");

    cy.wait("@getFCCertificationForAddCertificationPage");

    cy.get('[data-testid="fc-certification-description-card-title"]').should(
      "have.text",
      "Descriptif de la certification avec France compétences",
    );
  });

  it("let me click on the 'Enregistrer' button and lead me to its page", function () {
    interceptCertification();
    interceptAddFCCertificationMutation();

    cy.admin("/certifications/add-certification/description");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");

    cy.get('[data-testid="fc-certification-description-input"]')
      .children("input")
      .type("3890");

    cy.get("button").contains("Enregistrer").click();

    cy.wait("@addFCCertificationForAddCertificationPage");

    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/certifications/381f2b55-90cd-435a-ba32-53b7c9dc5f9b/",
    );
  });
});
