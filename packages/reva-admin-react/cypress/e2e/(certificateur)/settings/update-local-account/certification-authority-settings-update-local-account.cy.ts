import { stubQuery } from "../../../../utils/graphql";
import certificationAuthorityLocalAccountFixture from "./fixtures/certification-authority-local-account.json";

function interceptUpdateLocalAccount() {
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
      "getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      certificationAuthorityLocalAccountFixture,
    );
  });
}

context("main page", () => {
  context("when i access the update local account page ", () => {
    it("display the page with a correct title", function () {
      interceptUpdateLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      );

      cy.get('[data-test="update-certification-authority-local-account-page"]')
        .children("h1")
        .should("have.text", "jane doe");
    });
  });
});

context("general information summary card", () => {
  context("when i access the update local account page ", () => {
    it("display the general information summary card with the correct information", function () {
      interceptUpdateLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      );

      cy.get(
        '[data-test="local-account-general-information-summary-card"]',
      ).should("exist");

      cy.get(
        '[data-test="local-account-general-information-summary-card"] h2',
      ).should("have.text", "Informations générales");

      cy.get(
        '[data-test="local-account-general-information-summary-card"] [data-test="contact-full-name"]',
      ).should("have.text", "jane doe");

      cy.get(
        '[data-test="local-account-general-information-summary-card"] [data-test="contact-email"]',
      ).should("have.text", "monemail@example.com");
    });
  });
  context("when i click on the update button ", () => {
    it("redirect to the update general information page", function () {
      interceptUpdateLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      );

      cy.get(
        '[data-test="local-account-general-information-summary-card"] [data-test="action-button"]',
      ).click();

      cy.url().should(
        "include",
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/general-information",
      );
    });
  });
});
