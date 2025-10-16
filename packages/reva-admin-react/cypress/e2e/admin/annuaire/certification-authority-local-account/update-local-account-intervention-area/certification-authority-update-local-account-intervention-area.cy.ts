import { stubQuery } from "../../../../../utils/graphql";

import certificationAuthorityLocalAccountFixture from "./fixtures/certification-authority-local-account.json";
import updateCertificationAuthorityLocalAccountDepartmentsFixture from "./fixtures/update-certification-authority-local-account-departments-mutation-response.json";

function interceptUpdateLocalAccountInterventionArea() {
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
      "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
      certificationAuthorityLocalAccountFixture,
    );
    stubQuery(
      req,
      "updateCertificationAuthorityLocalAccountDepartmentsForAdminUpdateLocalAccountInterventionAreaPage",
      updateCertificationAuthorityLocalAccountDepartmentsFixture,
    );
  });
}

context("main page", () => {
  context(
    "when i access the update local account intervention area page ",
    () => {
      it("display the page with a correct title", () => {
        interceptUpdateLocalAccountInterventionArea();

        cy.admin(
          "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/zone-intervention",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getOrganismForAAPVisibilityCheck");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
        );

        cy.get(
          '[data-test="update-certification-authority-local-account-intervention-area-page"]',
        )
          .children("h1")
          .should("have.text", "Zone d’intervention");
      });

      it("display the correct form default values", () => {
        interceptUpdateLocalAccountInterventionArea();

        cy.admin(
          "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/zone-intervention",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getOrganismForAAPVisibilityCheck");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
        );

        cy.get(
          '[data-test="update-certification-authority-local-account-intervention-area-page"] [data-test="tree-select-item-Auvergne-Rhône-Alpes"] input',
        ).should("be.checked");

        cy.get(
          '[data-test="update-certification-authority-local-account-intervention-area-page"] [data-test="tree-select-item-Ain (01)"] input',
        ).should("be.checked");

        cy.get(
          '[data-test="update-certification-authority-local-account-intervention-area-page"] [data-test="tree-select-item-Rhône (69)"] input',
        ).should("be.checked");
      });

      it("do not let me click on the submit button if there is no changes", () => {
        interceptUpdateLocalAccountInterventionArea();

        cy.admin(
          "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/zone-intervention",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getOrganismForAAPVisibilityCheck");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
        );

        cy.get(
          '[data-test="update-certification-authority-local-account-intervention-area-page"] button[type="submit"]',
        ).should("be.disabled");
      });

      it("let me update the departments and submit the form", () => {
        interceptUpdateLocalAccountInterventionArea();

        cy.admin(
          "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/zone-intervention",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getOrganismForAAPVisibilityCheck");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
        );

        cy.get(
          '[data-test="tree-select-item-Pays de la Loire"] .fr-accordion__btn',
        ).click({ force: true });

        cy.get(
          '[data-test="tree-select-item-Loire-Atlantique (44)"] input',
        ).check({
          force: true,
        });

        cy.get(
          '[data-test="update-certification-authority-local-account-intervention-area-page"] button[type="submit"]',
        ).click();

        cy.wait(
          "@updateCertificationAuthorityLocalAccountDepartmentsForAdminUpdateLocalAccountInterventionAreaPage",
        );

        cy.url().should(
          "be.equal",
          Cypress.config("baseUrl") +
            "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/",
        );
      });
    },
  );
});
