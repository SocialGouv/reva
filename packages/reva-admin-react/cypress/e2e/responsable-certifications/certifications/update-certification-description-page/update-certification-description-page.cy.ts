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
    stubQuery(
      req,
      "getCertificationForCertificationRegistryManagerUpdateCertificationDescriptionPage",
      {
        data: {
          getCertification: {
            ...certificationBPBoucher.data.getCertification,
          },
        },
      },
    );
  });
}

context("when i access the update certification description page ", () => {
  it("display the page with a correct title", function () {
    interceptCertification();

    cy.admin(
      "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/description",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationForCertificationRegistryManagerUpdateCertificationDescriptionPage",
    );

    cy.get('[data-testid="certification-description-card"]')
      .children("div")
      .children("div")
      .children("h2")
      .should("have.text", "Informations liées au code RNCP 37310");
  });
});
