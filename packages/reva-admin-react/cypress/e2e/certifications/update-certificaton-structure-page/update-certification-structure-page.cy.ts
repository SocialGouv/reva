import { stubMutation, stubQuery } from "../../../utils/graphql";

import certificationAuthoritiesEducNat from "./fixtures/certification-authorities-educ-nat.json";
import certificationBPBoucher from "./fixtures/certification-bp-boucher.json";
import updateCertificationStructureMutationResponse from "./fixtures/update-certification-structure-mutation-response.json";

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
    stubQuery(
      req,
      "getCertificationAuthoritiesForUpdateCertificationStructurePage",
      certificationAuthoritiesEducNat,
    );
  });
}

function interceptUpdateCertificationStructureMutation() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubMutation(
      req,
      "updateCertificationStructureForUpdateCertificationStructurePage",
      updateCertificationStructureMutationResponse,
    );
  });
}

context("when i access the update certification structure page ", () => {
  it("display the page with a correct title", function () {
    interceptCertification();

    cy.admin(
      "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/structure/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationStructureAndGestionnairesForUpdateCertificationStructurePage",
    );
    cy.wait("@getCertificationAuthoritiesForUpdateCertificationStructurePage");

    cy.get('[data-testid="update-certification-structure-page"]')
      .children("h1")
      .should("have.text", "Structure certificatrice et gestionnaires");
  });

  it("let me update the certification structure and submit the form", function () {
    interceptCertification();
    interceptUpdateCertificationStructureMutation();
    cy.admin(
      "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/structure/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationStructureAndGestionnairesForUpdateCertificationStructurePage",
    );
    cy.wait("@getCertificationAuthoritiesForUpdateCertificationStructurePage");
    cy.get(
      '[data-testid="certification-authority-structure-select"] select',
    ).select("IPERIA");
    cy.wait("@getCertificationAuthoritiesForUpdateCertificationStructurePage");

    cy.get("button").contains("Enregistrer").click();

    cy.wait("@updateCertificationStructureForUpdateCertificationStructurePage");

    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/",
    );
  });
});
