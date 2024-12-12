import { stubQuery } from "../../../../utils/graphql";
import certificationBPBoucher from "./fixtures/certification-bp-boucher.json";

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
    stubQuery(req, "getCertificationForUpdateCertificationPrerequisitesPage", {
      data: {
        getCertification: {
          ...certificationBPBoucher.data.getCertification,
        },
      },
    });
  });
}

context("when i access the update certification page ", () => {
  it("display the page with a correct title", function () {
    interceptCertification();

    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/prerequisites",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationForUpdateCertificationPrerequisitesPage");

    cy.get('[data-test="update-certification-prerequisites-page"]')
      .children("h1")
      .should("have.text", "Prérequis obligatoires");
  });

  it("dont let me submit the form if no edit has been made", function () {
    interceptCertification();
    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/prerequisites",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationForUpdateCertificationPrerequisitesPage");

    cy.get("button").contains("Enregistrer").should("be.disabled");
  });

  it("let me add a new prerequisite to the certification", function () {
    interceptCertification();
    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/prerequisites",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationForUpdateCertificationPrerequisitesPage");

    cy.get('[data-test="prerequisite-list"] input').should("have.length", 2);

    cy.get('[data-test="add-prerequisite-button"]').click();

    cy.get('[data-test="prerequisite-list"] input').should("have.length", 3);
  });

  it("let me delete a prerequisite from the certification", function () {
    interceptCertification();
    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/prerequisites",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationForUpdateCertificationPrerequisitesPage");

    cy.get('[data-test="prerequisite-list"] input').should("have.length", 2);

    cy.get('[data-test="delete-prerequisite-button"]').eq(1).click();

    cy.get('[data-test="prerequisite-list"] input').should("have.length", 1);
  });
});
