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
