import { stubQuery } from "../../../../utils/graphql";

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
      "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
      certificationAuthorityLocalAccountFixture,
    );
    stubQuery(
      req,
      "updateCertificationAuthorityLocalAccountDepartmentsForUpdateLocalAccountInterventionAreaPage",
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

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/intervention-area",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getOrganismForAAPVisibilityCheck");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
        );

        cy.get(
          '[data-testid="update-certification-authority-local-account-intervention-area-page"]',
        )
          .children("h1")
          .should("have.text", "Zone d’intervention");
      });

      it("display the correct form default values", () => {
        interceptUpdateLocalAccountInterventionArea();

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/intervention-area",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getOrganismForAAPVisibilityCheck");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
        );

        cy.get(
          '[data-testid="update-certification-authority-local-account-intervention-area-page"] [data-testid="tree-select-item-Auvergne-Rhône-Alpes"] input',
        ).should("be.checked");

        cy.get(
          '[data-testid="update-certification-authority-local-account-intervention-area-page"] [data-testid="tree-select-item-Ain (01)"] input',
        ).should("be.checked");

        cy.get(
          '[data-testid="update-certification-authority-local-account-intervention-area-page"] [data-testid="tree-select-item-Rhône (69)"] input',
        ).should("be.checked");
      });

      it("do not let me click on the submit button if there is no changes", () => {
        interceptUpdateLocalAccountInterventionArea();

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/intervention-area",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getOrganismForAAPVisibilityCheck");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
        );

        cy.get(
          '[data-testid="update-certification-authority-local-account-intervention-area-page"] button[type="submit"]',
        ).should("be.disabled");
      });

      it("let me update the departments and submit the form", () => {
        interceptUpdateLocalAccountInterventionArea();

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/intervention-area",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getOrganismForAAPVisibilityCheck");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountInterventionAreaPage",
        );

        cy.get(
          '[data-testid="tree-select-item-Pays de la Loire"] .fr-accordion__btn',
        ).click({ force: true });

        cy.get(
          '[data-testid="tree-select-item-Loire-Atlantique (44)"] input',
        ).check({
          force: true,
        });

        cy.get(
          '[data-testid="update-certification-authority-local-account-intervention-area-page"] button[type="submit"]',
        ).click();

        cy.wait(
          "@updateCertificationAuthorityLocalAccountDepartmentsForUpdateLocalAccountInterventionAreaPage",
        );

        cy.url().should(
          "be.equal",
          Cypress.config("baseUrl") +
            "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/",
        );
      });
    },
  );
});
