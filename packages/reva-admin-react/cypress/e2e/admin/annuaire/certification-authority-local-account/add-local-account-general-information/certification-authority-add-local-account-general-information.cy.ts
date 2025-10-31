import { stubMutation, stubQuery } from "../../../../../utils/graphql";

import addCertificationAuthorityLocalAccountMutationFixture from "./fixtures/add-certification-authority-local-account-mutation-response.json";
import certificationAuthorityAndStructureFixture from "./fixtures/certification-authority-and-structure.json";

function interceptAddLocalAccountGeneralInformation() {
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
      "getCertificationAuthorityAndStructureForAdminAddLocalAccountGeneralInformationPage",
      certificationAuthorityAndStructureFixture,
    );

    stubMutation(
      req,
      "addCertificationAuthorityLocalAccountGeneralInformationForAdminAddLocalAccountGeneralInformationPage",
      addCertificationAuthorityLocalAccountMutationFixture,
    );
  });
}

context("main page", () => {
  context(
    "when i access the add local account general information page ",
    () => {
      it("display the page with a correct title", () => {
        interceptAddLocalAccountGeneralInformation();

        cy.admin(
          "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter/informations-generales",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getOrganismForAAPVisibilityCheck");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityAndStructureForAdminAddLocalAccountGeneralInformationPage",
        );

        cy.get(
          '[data-testid="add-certification-authority-local-account-general-information-page"]',
        )
          .children("h1")
          .should("have.text", "Informations générales");
      });

      it("let me fill the fields and submit the form", () => {
        interceptAddLocalAccountGeneralInformation();

        cy.admin(
          "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/ajouter/informations-generales",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getOrganismForAAPVisibilityCheck");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityAndStructureForAdminAddLocalAccountGeneralInformationPage",
        );

        cy.get(
          '[data-testid="add-certification-authority-local-account-general-information-page"] [data-testid="account-lastname-input"] input',
        )
          .clear()
          .type("new account last name");

        cy.get(
          '[data-testid="add-certification-authority-local-account-general-information-page"] [data-testid="account-firstname-input"] input',
        )
          .clear()
          .type("new account first name");

        cy.get(
          '[data-testid="add-certification-authority-local-account-general-information-page"] [data-testid="account-email-input"] input',
        )
          .clear()
          .type("newaccount.email@example.com");

        cy.get(
          '[data-testid="add-certification-authority-local-account-general-information-page"] [data-testid="contact-full-name-input"] input',
        )
          .clear()
          .type("new contact full name");

        cy.get(
          '[data-testid="add-certification-authority-local-account-general-information-page"] [data-testid="contact-email-input"] input',
        )
          .clear()
          .type("newcontact.email@example.com");

        cy.get(
          '[data-testid="add-certification-authority-local-account-general-information-page"] [data-testid="contact-phone-input"] input',
        )
          .clear()
          .type("9999999999");

        cy.get(
          '[data-testid="add-certification-authority-local-account-general-information-page"] button[type="submit"]',
        ).click();

        cy.wait(
          "@addCertificationAuthorityLocalAccountGeneralInformationForAdminAddLocalAccountGeneralInformationPage",
        );

        cy.url().should(
          "be.equal",
          Cypress.config("baseUrl") +
            "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/f7b5b065-f1c5-47d3-aa0c-c826deee8fa6/",
        );
      });
    },
  );
});
