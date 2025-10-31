import { stubQuery } from "../../../../utils/graphql";

import activeFeaturesFixture from "./fixtures/active-features.json";
import certificationAuthorityFixture from "./fixtures/certification-authority.json";

function interceptQueries() {
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
      "getCertificationAuthorityForAdminPage",
      certificationAuthorityFixture,
    );
  });
}

context("main page", () => {
  context("when i access the admin certification authority page ", () => {
    it("display the page with a correct title", function () {
      interceptQueries();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationAuthorityForAdminPage");

      cy.get('[data-testid="certification-authority-admin-page"] h1').should(
        "have.text",
        "certification authority label",
      );
    });
  });
});

context("local accounts summary card", () => {
  context("when i access the admin certification authority page ", () => {
    it("display the local accounts summary card", function () {
      interceptQueries();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationAuthorityForAdminPage");

      cy.get(
        '[data-testid="certification-authority-local-accounts-summary-card"] h2',
      ).should("have.text", "Comptes locaux");
    });

    it("display 2 local accounts", function () {
      interceptQueries();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationAuthorityForAdminPage");

      cy.get(
        '[data-testid="certification-authority-local-accounts-summary-card-list"]',
      )
        .children("li")
        .should("have.length", 2);
    });

    it("display a warning badge when there is no contact email", function () {
      interceptQueries();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationAuthorityForAdminPage");

      cy.get(
        '[data-testid="certification-authority-local-accounts-summary-card-list"]',
      )
        .children("li")
        .first()
        .find('[data-testid="no-contact-referent-badge"]')
        .should("exist");
    });

    it("do not display a warning badge when there is a contact email", function () {
      interceptQueries();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationAuthorityForAdminPage");

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
      interceptQueries();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationAuthorityForAdminPage");

      cy.get(
        '[data-testid="certification-authority-local-accounts-summary-card"] [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "include",
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter/",
      );
    });
  });

  context("when i click on the update button", () => {
    it("redirect to the update local account page", function () {
      interceptQueries();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationAuthorityForAdminPage");

      cy.get(
        '[data-testid="certification-authority-local-accounts-summary-card-list"]',
      )
        .children("li")
        .first()
        .find('[data-testid="update-local-account-button"]')
        .click();

      cy.url().should(
        "include",
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
    });
  });
});
