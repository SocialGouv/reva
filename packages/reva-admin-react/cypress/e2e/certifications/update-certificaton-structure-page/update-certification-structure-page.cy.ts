import { stubQuery } from "../../../utils/graphql";
import certificationBPBoucher from "./fixtures/certification-bp-boucher.json";

function interceptCertification() {
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
    stubQuery(
      req,
      "getCertificationStructureAndGestionnairesForUpdateCertificationStructurePage",
      certificationBPBoucher,
    );
  });
}

context("when i access the update certification page ", () => {
  it("display the page with a correct title", function () {
    interceptCertification();

    cy.admin(
      "http://localhost:3003/admin2/certifications-v2/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/structure/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationStructureAndGestionnairesForUpdateCertificationStructurePage",
    );

    cy.get('[data-test="update-certification-structure-page"]')
      .children("h1")
      .should("have.text", "Structure certificatrice et gestionnaires");
  });
});
