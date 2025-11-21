import { stubMutation, stubQuery } from "../../../../utils/graphql";

import addCertificationAuthorityLocalAccountMutationFixture from "./fixtures/add-certification-authority-local-account-mutation-response.json";
import certificationAuthorityFixture from "./fixtures/certification-authority.json";

function interceptAddLocalAccountGeneralInformation() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "activeFeaturesForConnectedUser",
      "features/active-features.json",
    );
    stubQuery(
      req,
      "getMaisonMereCGUQuery",
      "account/gestionnaire-cgu-accepted.json",
    );
    stubQuery(
      req,
      "getCertificationAuthorityForAddLocalAccountGeneralInformationPage",
      certificationAuthorityFixture,
    );

    stubMutation(
      req,
      "addCertificationAuthorityLocalAccountGeneralInformationForAddLocalAccountGeneralInformationPage",
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

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/add-local-account/general-information",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityForAddLocalAccountGeneralInformationPage",
        );

        cy.get(
          '[data-testid="add-certification-authority-local-account-general-information-page"]',
        )
          .children("h1")
          .should("have.text", "Informations générales");
      });

      it("let me fill the fields and submit the form", () => {
        interceptAddLocalAccountGeneralInformation();

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/add-local-account/general-information",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityForAddLocalAccountGeneralInformationPage",
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
          "@addCertificationAuthorityLocalAccountGeneralInformationForAddLocalAccountGeneralInformationPage",
        );

        cy.url().should(
          "be.equal",
          Cypress.config("baseUrl") +
            "/certification-authorities/settings/local-accounts/f7b5b065-f1c5-47d3-aa0c-c826deee8fa6/",
        );
      });
    },
  );
});
