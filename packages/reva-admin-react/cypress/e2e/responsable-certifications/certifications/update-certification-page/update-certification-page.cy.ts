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
      "getCertificationForCertificationRegistryManagerUpdateCertificationPage",
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

context("when i access the update certification page ", () => {
  it("display the page with a correct title", function () {
    interceptCertification();

    cy.admin(
      "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
    );

    cy.get(
      '[data-test="certification-registry-manager-update-certification-page"]',
    )
      .children("h1")
      .should("have.text", "37310 - BP Boucher");
  });
});
