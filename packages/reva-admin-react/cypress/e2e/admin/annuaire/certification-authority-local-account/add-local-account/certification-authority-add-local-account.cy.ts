import { stubQuery } from "../../../../../utils/graphql";

import certificationAuthorityAndStructureFixture from "./fixtures/certification-authority-and-structure.json";

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
    stubQuery(
      req,
      "getCertificationAuthorityAndStructureForAdminAddLocalAccountPage",
      certificationAuthorityAndStructureFixture,
    );
  });
}

context("main page", () => {
  context("when i access the add local account page", () => {
    it("display the page with a correct title", () => {
      interceptAddLocalAccount();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityAndStructureForAdminAddLocalAccountPage",
      );

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

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityAndStructureForAdminAddLocalAccountPage",
      );

      cy.get(
        '[data-testid="local-account-general-information-summary-card"] [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "include",
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter/informations-generales",
      );
    });
  });
});
