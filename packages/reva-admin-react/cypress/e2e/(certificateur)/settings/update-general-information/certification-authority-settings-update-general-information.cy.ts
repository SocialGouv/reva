import { stubQuery } from "../../../../utils/graphql";

import certificationAuthorityFixture from "./fixtures/certification-authority-info.json";

function interceptUpdateGeneralInformation() {
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
      "getCertificationAuthorityGeneralInfoForEditPage",
      certificationAuthorityFixture,
    );
  });
}

context("main page", () => {
  context("when i access the update general information page ", () => {
    it("display the page with a correct title", () => {
      interceptUpdateGeneralInformation();

      cy.certificateur(
        "/certification-authorities/settings/informations-generales",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationAuthorityGeneralInfoForEditPage");

      cy.get(
        '[data-testid="certification-authority-general-info-page-title"]',
      ).should("have.text", "Informations générales");
    });

    it("display the correct form default values", () => {
      interceptUpdateGeneralInformation();

      cy.certificateur(
        "/certification-authorities/settings/informations-generales",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationAuthorityGeneralInfoForEditPage");

      cy.get('[data-testid="certification-authority-label"] input').should(
        "have.value",
        "certification authority label",
      );

      cy.get(
        '[data-testid="certification-authority-account-lastname"] input',
      ).should("have.value", "doe admin");

      cy.get(
        '[data-testid="certification-authority-account-firstname"] input',
      ).should("have.value", "jane admin");

      cy.get(
        '[data-testid="certification-authority-account-email"] input',
      ).should("have.value", "monemaildeconnexion@example.com");

      cy.get(
        '[data-testid="certification-authority-contact-full-name"] input',
      ).should("have.value", "jane doe");

      cy.get(
        '[data-testid="certification-authority-contact-email"] input',
      ).should("have.value", "monemail@example.com");

      cy.get(
        '[data-testid="certification-authority-contact-phone"] input',
      ).should("have.value", "0101010101");
    });

    it("do not let me click on the submit button if there is no changes", () => {
      interceptUpdateGeneralInformation();

      cy.certificateur(
        "/certification-authorities/settings/informations-generales",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationAuthorityGeneralInfoForEditPage");

      cy.get('[data-testid="certification-authority-submit-button"]').should(
        "be.disabled",
      );
    });
  });
});
