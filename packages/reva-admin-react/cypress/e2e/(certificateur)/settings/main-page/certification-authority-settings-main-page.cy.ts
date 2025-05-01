import { stubQuery } from "../../../../utils/graphql";
import certificationAuthoritySettingsFixture from "./fixtures/certification-authority-settings.json";
import activeFeaturesFixture from "./fixtures/active-features.json";

function interceptSettings() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(req, "activeFeaturesForConnectedUser", activeFeaturesFixture);
    stubQuery(req, "getOrganismForAAPVisibilityCheck", "visibility/admin.json");
    stubQuery(
      req,
      "getMaisonMereCGUQuery",
      "account/gestionnaire-cgu-accepted.json",
    );
    stubQuery(
      req,
      "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      certificationAuthoritySettingsFixture,
    );
  });
}

context("main page", () => {
  context("when i access the settings page ", () => {
    it("display the page with a correct title", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get('[data-test="certification-authority-settings-page"]')
        .children("h1")
        .should("have.text", "Paramètres");
    });
  });
});

context("local accounts summary card", () => {
  context("when i access the settings page ", () => {
    it("display the local accounts summary card", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-test="certification-authority-local-accounts-summary-card"] h2',
      ).should("have.text", "Comptes locaux");
    });

    it("display 2 local accounts", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-test="certification-authority-local-accounts-summary-card-list"]',
      )
        .children("li")
        .should("have.length", 2);
    });

    it("display a warning badge when there is no contact email", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-test="certification-authority-local-accounts-summary-card-list"]',
      )
        .children("li")
        .first()
        .find('[data-test="no-contact-referent-badge"]')
        .should("exist");
    });

    it("do not display a warning badge when there is a contact email", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-test="certification-authority-local-accounts-summary-card-list"]',
      )
        .children("li")
        .last()
        .find('[data-test="no-contact-referent-badge"]')
        .should("not.exist");
    });
  });
  context("when i click on the add button", () => {
    it("redirect to the add local account page", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-test="certification-authority-local-accounts-summary-card"] [data-test="action-button"]',
      ).click();

      cy.url().should(
        "include",
        "/certification-authorities/settings/local-accounts/add-local-account",
      );
    });
  });

  context("when i click on the edit button", () => {
    it("redirect to the edit local account page", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-test="certification-authority-local-accounts-summary-card-list"]',
      )
        .children("li")
        .first()
        .find('[data-test="edit-local-account-button"]')
        .click();

      cy.url().should(
        "include",
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
    });
  });
});
