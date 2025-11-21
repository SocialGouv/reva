import { stubMutation, stubQuery } from "../../../../utils/graphql";

import certificationAuthorityLocalAccountFixture from "./fixtures/certification-authority-local-account.json";
import updateCertificationAuthorityLocalAccountMutationFixture from "./fixtures/update-certification-authority-local-account-mutation-response.json";

function interceptUpdateLocalAccountGeneralInformation() {
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
      "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
      certificationAuthorityLocalAccountFixture,
    );

    stubMutation(
      req,
      "updateCertificationAuthorityLocalAccountGeneralInformationForUpdateLocalAccountGeneralInformationPage",
      updateCertificationAuthorityLocalAccountMutationFixture,
    );
  });
}

context("main page", () => {
  context(
    "when i access the update local account general information page ",
    () => {
      it("display the page with a correct title", () => {
        interceptUpdateLocalAccountGeneralInformation();

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/general-information",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
        );

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"]',
        )
          .children("h1")
          .should("have.text", "Informations générales");
      });

      it("display the correct form default values", () => {
        interceptUpdateLocalAccountGeneralInformation();

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/general-information",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
        );

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] [data-testid="certification-authority-label-input"] input',
        ).should("have.value", "Certification Authority");

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] [data-testid="account-lastname-input"] input',
        ).should("have.value", "doe");

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] [data-testid="account-firstname-input"] input',
        ).should("have.value", "jane");

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] [data-testid="account-email-input"] input',
        ).should("have.value", "monemail@example.com");

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] [data-testid="contact-full-name-input"] input',
        ).should("have.value", "contact full name");

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] [data-testid="contact-email-input"] input',
        ).should("have.value", "contact@example.com");

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] [data-testid="contact-phone-input"] input',
        ).should("have.value", "0123456789");
      });

      it("do not let me click on the submit button if there is no changes", () => {
        interceptUpdateLocalAccountGeneralInformation();

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/general-information",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
        );

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] button[type="submit"]',
        ).should("be.disabled");
      });

      it("let me change the contact fields and submit the form", () => {
        interceptUpdateLocalAccountGeneralInformation();

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/general-information",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
        );

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] [data-testid="contact-full-name-input"] input',
        )
          .clear()
          .type("new contact full name");

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] [data-testid="contact-email-input"] input',
        )
          .clear()
          .type("newcontact.email@example.com");

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] [data-testid="contact-phone-input"] input',
        )
          .clear()
          .type("9999999999");

        cy.get(
          '[data-testid="update-certification-authority-local-account-general-information-page"] button[type="submit"]',
        ).click();

        cy.wait(
          "@updateCertificationAuthorityLocalAccountGeneralInformationForUpdateLocalAccountGeneralInformationPage",
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
