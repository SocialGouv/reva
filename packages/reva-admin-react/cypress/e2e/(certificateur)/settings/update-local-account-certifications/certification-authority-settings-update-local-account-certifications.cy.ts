import { stubMutation, stubQuery } from "../../../../utils/graphql";

import certificationAuthorityLocalAccountFixture from "./fixtures/certification-authority-local-account.json";
import updateCertificationAuthorityLocalAccountCertificationsFixture from "./fixtures/update-certification-authority-local-account-certifications-mutation-response.json";

function interceptUpdateLocalAccountCertifications() {
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
      "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
      certificationAuthorityLocalAccountFixture,
    );
    stubMutation(
      req,
      "updateCertificationAuthorityLocalAccountCertificationsForUpdateLocalAccountCertificationsPage",
      updateCertificationAuthorityLocalAccountCertificationsFixture,
    );
  });
}

context("main page", () => {
  context("when i access the update local account certifications page ", () => {
    it("display the page with a correct title", () => {
      interceptUpdateLocalAccountCertifications();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/certifications",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
      );

      cy.get(
        '[data-testid="update-certification-authority-local-account-certifications-page"]',
      )
        .children("h1")
        .should("have.text", "Certifications gérées");
    });

    it("display the correct form default values", () => {
      interceptUpdateLocalAccountCertifications();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/certifications",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
      );

      cy.get(
        '[data-testid="tree-select-item-37310 - CQP Animateur d\'équipe autonome de production industrielle"] input',
      ).should("not.be.checked");

      cy.get(
        '[data-testid="tree-select-item-49872 - Diplôme d\'Etat Conseiller en économie sociale et familiale - DEESF"] input',
      ).should("be.checked");

      cy.get(
        '[data-testid="tree-select-item-37310 - CQP Animateur d\'équipe autonome de production industrielle"] input',
      ).should("not.be.checked");
    });

    it("do not let me click on the submit button if there is no changes", () => {
      interceptUpdateLocalAccountCertifications();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/certifications",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
      );

      cy.get(
        '[data-testid="update-certification-authority-local-account-certifications-page"] button[type="submit"]',
      ).should("be.disabled");
    });

    it("let me update the certifications and submit the form", () => {
      interceptUpdateLocalAccountCertifications();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/certifications",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
      );

      cy.get(
        '[data-testid="tree-select-item-37310 - CQP Animateur d\'équipe autonome de production industrielle"] input',
      ).check({
        force: true,
      });

      cy.get(
        '[data-testid="update-certification-authority-local-account-certifications-page"] button[type="submit"]',
      ).click();

      cy.wait(
        "@updateCertificationAuthorityLocalAccountCertificationsForUpdateLocalAccountCertificationsPage",
      );

      cy.url().should(
        "be.equal",
        Cypress.config("baseUrl") +
          "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/",
      );
    });
  });
});
