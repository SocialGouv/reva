import { stubMutation, stubQuery } from "../../../../utils/graphql";

import certificationAuthorityLocalAccountNoContactDetailsFixture from "./fixtures/certification-authority-local-account-no-contact-details.json";
import certificationAuthorityLocalAccountFixture from "./fixtures/certification-authority-local-account.json";
import deleteCertificationAuthorityLocalAccountFixture from "./fixtures/delete-certification-authority-local-account-mutation-response.json";

function interceptUpdateLocalAccount(params?: { noContactDetails?: boolean }) {
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
      "getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      params?.noContactDetails
        ? certificationAuthorityLocalAccountNoContactDetailsFixture
        : certificationAuthorityLocalAccountFixture,
    );
    stubMutation(
      req,
      "deleteCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      deleteCertificationAuthorityLocalAccountFixture,
    );
  });
}

context("main page", () => {
  context("when i access the update local account page ", () => {
    it("display the page with a correct title", () => {
      interceptUpdateLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      );

      cy.get(
        '[data-testid="update-certification-authority-local-account-page"]',
      )
        .children("h1")
        .should("have.text", "jane doe");
    });
  });
});

context("general information summary card", () => {
  context("when i access the update local account page ", () => {
    it("display the general information summary card with the correct information", () => {
      interceptUpdateLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      );

      cy.get(
        '[data-testid="local-account-general-information-summary-card"]',
      ).should("exist");

      cy.get(
        '[data-testid="local-account-general-information-summary-card"] h2',
      ).should("have.text", "Informations générales");

      cy.get(
        '[data-testid="local-account-general-information-summary-card"] [data-testid="contact-full-name"]',
      ).should("have.text", "contact full name");

      cy.get(
        '[data-testid="local-account-general-information-summary-card"] [data-testid="contact-email"]',
      ).should("have.text", "contact.email@example.com");
    });
  });

  context(
    "when i access the update local account page with no contact details",
    () => {
      it("display the general information summary card with the correct information", () => {
        interceptUpdateLocalAccount({ noContactDetails: true });

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
        );

        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
        );

        cy.get('[data-testid="no-contact-details-badge"]').should("exist");
      });
    },
  );
});
context("when i click on the update button ", () => {
  it("redirect to the update general information page", () => {
    interceptUpdateLocalAccount();

    cy.certificateur(
      "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
    );

    cy.get(
      '[data-testid="local-account-general-information-summary-card"] [data-testid="action-button"]',
    ).click();

    cy.url().should(
      "include",
      "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/general-information",
    );
  });
});

context("intervention area summary card", () => {
  context("when i access the update local account page ", () => {
    it("display the intervention area summary card with the correct information", () => {
      interceptUpdateLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      );

      cy.get('[data-testid="intervention-area-summary-card"]').should("exist");

      cy.get('[data-testid="intervention-area-summary-card"] h2').should(
        "have.text",
        "Zone d'intervention",
      );

      cy.get('[data-testid="department-tag-01"]').should("exist");
      cy.get('[data-testid="department-tag-63"]').should("exist");
    });
  });
  context("when i click on the update button ", () => {
    it("redirect to the update intervention area page", () => {
      interceptUpdateLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      );

      cy.get(
        '[data-testid="intervention-area-summary-card"] [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "include",
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/intervention-area/",
      );
    });
  });
});

context("certifications summary card", () => {
  context("when i access the update local account page ", () => {
    it("display the certifications summary card with the correct information", () => {
      interceptUpdateLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      );

      cy.get('[data-testid="certifications-summary-card"]').should("exist");

      cy.get('[data-testid="certifications-summary-card"] h2').should(
        "have.text",
        "Certifications gérées",
      );

      cy.get(
        '[data-testid="certifications-summary-card"] [data-testid="certifications-count-badge"]',
      ).should("have.text", "2 certifications gérées");
    });
  });
  context("when i click on the update button ", () => {
    it("redirect to the update certifications page", () => {
      interceptUpdateLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      );

      cy.get(
        '[data-testid="certifications-summary-card"] [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "include",
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869/certifications/",
      );
    });
  });
});

context("delete button", () => {
  context("when i access the update local account page ", () => {
    it("display the delete button", () => {
      interceptUpdateLocalAccount();

      cy.certificateur(
        "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
      );

      cy.get(
        '[data-testid="delete-certification-authority-local-account-button"]',
      ).should("exist");
    });
  });
  context(
    "when i click the delete local account button and confirm the deletion",
    () => {
      it.skip("delete the local account and redirect to the settings page", () => {
        interceptUpdateLocalAccount();

        cy.certificateur(
          "/certification-authorities/settings/local-accounts/4871a711-232b-4aba-aa5a-bc2adc51f869",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
        );

        cy.get(
          '[data-testid="delete-certification-authority-local-account-button"]',
        ).click();

        cy.get(
          '[data-testid="delete-certification-authority-local-account-confirm-button"]',
        ).click();

        cy.wait(
          "@deleteCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage",
        );

        cy.url().should(
          "be.equal",
          Cypress.config("baseUrl") + "/certification-authorities/settings/",
        );
      });
    },
  );
});
