import { stubQuery } from "../../../../utils/graphql";
function interceptAddLocalAccount() {
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
  });
}

context("main page", () => {
  context("when i access the add local account page", () => {
    it("display the page with a correct title", () => {
      interceptAddLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/add-local-account",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");

      cy.get('[data-testid="add-certification-authority-local-account-page"]')
        .children("h1")
        .should("have.text", "Nouveau compte local");
    });
  });
});

context("general information summary card", () => {
  context("when i click on the update button", () => {
    it("redirect me to the add local account general information page", () => {
      interceptAddLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/add-local-account",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");

      cy.get(
        '[data-testid="local-account-general-information-summary-card"] [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "include",
        "/certification-authorities/settings/local-accounts/add-local-account/general-information/",
      );
    });
  });
});
