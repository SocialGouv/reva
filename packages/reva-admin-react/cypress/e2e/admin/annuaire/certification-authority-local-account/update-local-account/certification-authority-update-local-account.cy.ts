import { stubQuery } from "../../../../../utils/graphql";

import activeFeaturesFixture from "./fixtures/active-features.json";
import certificationAuthorityLocalAccountNoContactDetailsFixture from "./fixtures/certification-authority-local-account-no-contact-details.json";
import certificationAuthorityLocalAccountFixture from "./fixtures/certification-authority-local-account.json";

function interceptUpdateLocalAccount(params?: { noContactDetails?: boolean }) {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(req, "activeFeaturesForConnectedUser", activeFeaturesFixture);

    stubQuery(
      req,
      "getMaisonMereCGUQuery",
      "account/gestionnaire-cgu-accepted.json",
    );

    stubQuery(
      req,
      "getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
      params?.noContactDetails
        ? certificationAuthorityLocalAccountNoContactDetailsFixture
        : certificationAuthorityLocalAccountFixture,
    );
  });
}

context("main page", () => {
  context("when i access the update local account page ", () => {
    it("display the page with a correct title", () => {
      interceptUpdateLocalAccount();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");

      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
      );
      cy.get(
        '[data-testid="update-certification-authority-local-account-page"]  h1',
      )
        .first()
        .should("have.text", "jane doe");
    });
  });
});

context("general information summary card", () => {
  context("when i access the update local account page ", () => {
    it("display the general information summary card with the correct information", () => {
      interceptUpdateLocalAccount();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");

      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
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

        cy.admin(
          "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
        );

        cy.wait("@activeFeaturesForConnectedUser");

        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
        );

        cy.get('[data-testid="no-contact-details-badge"]').should("exist");
      });
    },
  );
});
context("when i click on the update button ", () => {
  it("redirect to the update general information page", () => {
    interceptUpdateLocalAccount();

    cy.admin(
      "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
    );
    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
    );

    cy.get(
      '[data-testid="local-account-general-information-summary-card"] [data-testid="action-button"]',
    ).click();

    cy.url().should(
      "include",
      "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/informations-generales",
    );
  });
});

context("intervention area summary card", () => {
  context("when i access the update local account page ", () => {
    it("display the intervention area summary card with the correct information", () => {
      interceptUpdateLocalAccount();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");

      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
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

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");

      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
      );

      cy.get(
        '[data-testid="intervention-area-summary-card"] [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "include",
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/zone-intervention/",
      );
    });
  });
});

context("certifications summary card", () => {
  context("when i access the update local account page ", () => {
    it("display the certifications summary card with the correct information", () => {
      interceptUpdateLocalAccount();

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");

      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
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

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      cy.wait("@activeFeaturesForConnectedUser");

      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
      );

      cy.get(
        '[data-testid="certifications-summary-card"] [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "include",
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/certifications/",
      );
    });
  });
});
