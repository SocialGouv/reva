import { stubQuery } from "../../../../utils/graphql";

import activeFeaturesFixture from "./fixtures/active-features.json";
import certificationAuthoritySettingsNoContactInfoFixture from "./fixtures/certification-authority-settings-no-contact-info.json";
import certificationAuthoritySettingsFixture from "./fixtures/certification-authority-settings.json";

function interceptSettings(hasContactInfo = true) {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(req, "activeFeaturesForConnectedUser", activeFeaturesFixture);
    stubQuery(
      req,
      "getMaisonMereCGUQuery",
      "account/gestionnaire-cgu-accepted.json",
    );
    stubQuery(
      req,
      "getCertificationAuthorityForCertificationAuthoritySettingsPage",
      hasContactInfo
        ? certificationAuthoritySettingsFixture
        : certificationAuthoritySettingsNoContactInfoFixture,
    );
  });
}

context("main page", () => {
  context("when i access the settings page ", () => {
    it("display the page with a correct title", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get('[data-testid="certification-authority-settings-page"]')
        .children("h1")
        .should("have.text", "Paramètres");
    });
  });
});

context("general information summary card", () => {
  context("when i access the settings page ", () => {
    it("display the general information summary card with the correct information", () => {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-testid="certification-authority-general-information-card"]',
      ).should("exist");

      cy.get(
        '[data-testid="certification-authority-general-information-card"] h2',
      ).should("have.text", "Informations générales");

      cy.get(
        '[data-testid="certification-authority-general-information-card"] [data-testid="certification-authority-label"]',
      ).should("have.text", "certification authority label");

      cy.get(
        '[data-testid="certification-authority-general-information-card"] [data-testid="contact-full-name"]',
      ).should("have.text", "jane doe");

      cy.get(
        '[data-testid="certification-authority-general-information-card"] [data-testid="contact-email"]',
      ).should("have.text", "monemail@example.com");

      cy.get(
        '[data-testid="certification-authority-general-information-card"] [data-testid="contact-phone"]',
      ).should("have.text", "0101010101");

      cy.get(
        '[data-testid="certification-authority-general-information-card"] [data-testid="completed-badge"]',
      ).should("exist");
    });

    it("shows a button to update the general information", () => {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-testid="certification-authority-general-information-card"] [data-testid="action-button"]',
      ).should("have.text", "Modifier");
      cy.get(
        '[data-testid="certification-authority-general-information-card"] [data-testid="action-button"]',
      ).should("be.enabled");
      cy.get(
        '[data-testid="certification-authority-general-information-card"] [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "include",
        "/certification-authorities/settings/informations-generales",
      );
    });

    it("should show a to complete badge when general information is missing", () => {
      interceptSettings(false);

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-testid="certification-authority-general-information-card"] [data-testid="to-complete-badge"]',
      ).should("exist");
    });

    it("should show a no-contact-info badge when contact info is missing", () => {
      interceptSettings(false);

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-testid="certification-authority-general-information-card"] [data-testid="no-contact-badge"]',
      ).should("exist");
    });

    it("should show a no contact notice when contact info is missing", () => {
      interceptSettings(false);

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-testid="certification-authority-general-information-card"] [data-testid="no-contact-notice"]',
      ).should("exist");
    });
  });
});

context("local accounts summary card", () => {
  context("when i access the settings page ", () => {
    it("display the local accounts summary card", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-testid="certification-authority-local-accounts-summary-card"] h2',
      ).should("have.text", "Comptes locaux");
    });

    it("display 2 local accounts", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-testid="certification-authority-local-accounts-summary-card-list"]',
      )
        .children("li")
        .should("have.length", 2);
    });

    it("display a warning badge when there is no contact email", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-testid="certification-authority-local-accounts-summary-card-list"]',
      )
        .children("li")
        .first()
        .find('[data-testid="no-contact-referent-badge"]')
        .should("exist");
    });

    it("do not display a warning badge when there is a contact email", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-testid="certification-authority-local-accounts-summary-card-list"]',
      )
        .children("li")
        .last()
        .find('[data-testid="no-contact-referent-badge"]')
        .should("not.exist");
    });
  });
  context("when i click on the add button", () => {
    it("redirect to the add local account page", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-testid="certification-authority-local-accounts-summary-card"] [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "include",
        "/certification-authorities/settings/local-accounts/add-local-account",
      );
    });
  });

  context("when i click on the update button", () => {
    it("redirect to the update local account page", function () {
      interceptSettings();

      cy.certificateur("/certification-authorities/settings");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityForCertificationAuthoritySettingsPage",
      );

      cy.get(
        '[data-testid="certification-authority-local-accounts-summary-card-list"]',
      )
        .children("li")
        .first()
        .find('[data-testid="update-local-account-button"]')
        .click();

      cy.url().should(
        "include",
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
    });
  });
});
