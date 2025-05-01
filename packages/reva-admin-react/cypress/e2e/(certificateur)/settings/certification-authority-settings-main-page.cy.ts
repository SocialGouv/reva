import { stubQuery } from "../../../utils/graphql";
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
