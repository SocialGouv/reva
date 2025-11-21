import { stubQuery } from "../../../utils/graphql";

import certifications from "./fixtures/certifications.json";

function interceptCertifications(status: string, visible = true) {
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
    const filteredRows =
      certifications.data.searchCertificationsV2ForRegistryManager.rows.filter(
        (certification) =>
          certification.status === status && certification.visible === visible,
      );
    stubQuery(req, "getCertificationsV2ForRegistryManager", {
      ...certifications,
      data: {
        ...certifications.data,
        searchCertificationsV2ForRegistryManager: {
          ...certifications.data.searchCertificationsV2ForRegistryManager,
          rows: filteredRows,
          info: {
            ...certifications.data.searchCertificationsV2ForRegistryManager
              .info,
            totalRows: filteredRows.length,
          },
        },
      },
    });
  });
}

context("when I access the registry manager homepage", () => {
  it("show correct empty state component when registry manager has no attached certifications", function () {
    interceptCertifications("EMPTY", true);

    cy.admin("/responsable-certifications/");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForRegistryManager");
    cy.get('[data-testid="no-certifications"]').should("be.visible");
  });

  it("show correct component when registry manager has certifications to validate", function () {
    interceptCertifications("A_VALIDER_PAR_CERTIFICATEUR", true);

    cy.admin("/responsable-certifications/");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForRegistryManager");
    cy.get('[data-testid="no-certifications"]').should("not.exist");
    cy.get('[data-testid="certifications-to-validate"]').should("be.visible");
    cy.get('[data-testid="efa751cb-f5c2-4d90-b390-e5726eeebb19"]').should(
      "be.visible",
    );
    cy.get('[data-testid="efa751cb-f5c2-4d90-b390-e5726eeebb19"]').should(
      "have.text",
      "RNCP12296 - Bac Professionnel Accompagnement, soins et services à la personnes Option A : à domicile",
    );
  });
});

context("when i access the certification list", () => {
  it("redirect to the pending validation certification list", function () {
    interceptCertifications("A_VALIDER_PAR_CERTIFICATEUR");

    cy.admin("/responsable-certifications/certifications");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForRegistryManager");
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/responsable-certifications/certifications/?status=A_VALIDER_PAR_CERTIFICATEUR&page=1",
    );
  });

  it("show correct empty state component when there are no certifications to validate", function () {
    interceptCertifications("A_VALIDER_PAR_CERTIFICATEUR_EMPTY");

    cy.admin("/responsable-certifications/certifications");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForRegistryManager");
    cy.get('[data-testid="no-certifications-to-validate"]').should(
      "be.visible",
    );
  });

  it("show correct empty state component when there are no visible certifications", function () {
    interceptCertifications("VALIDE_PAR_CERTIFICATEUR_EMPTY", true);

    cy.admin(
      "/responsable-certifications/certifications?status=VALIDE_PAR_CERTIFICATEUR&visible=true&page=1",
    );
    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForRegistryManager");
    cy.get('[data-testid="no-visible-certifications"]').should("be.visible");
  });

  it("show correct empty state component when there are no invisible certifications", function () {
    interceptCertifications("VALIDE_PAR_CERTIFICATEUR_EMPTY", false);

    cy.admin(
      "/responsable-certifications/certifications?status=VALIDE_PAR_CERTIFICATEUR&visible=false&page=1",
    );
    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForRegistryManager");
    cy.get('[data-testid="no-invisible-certifications"]').should("be.visible");
  });

  it("let me click on the 'access certification' button when status is A_VALIDER_PAR_CERTIFICATEUR", function () {
    interceptCertifications("A_VALIDER_PAR_CERTIFICATEUR");

    cy.admin("/responsable-certifications/certifications");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForRegistryManager");
    cy.get('[data-testid="access-certification-button"]').click({
      force: true,
    });
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/responsable-certifications/certifications/efa751cb-f5c2-4d90-b390-e5726eeebb19/",
    );
  });

  it("let me click on the 'access certification' button when status is VALIDE_PAR_CERTIFICATEUR and visible is true", function () {
    interceptCertifications("VALIDE_PAR_CERTIFICATEUR", true);

    cy.admin(
      "/responsable-certifications/certifications?status=VALIDE_PAR_CERTIFICATEUR&visible=true&page=1",
    );
    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForRegistryManager");
    cy.get('[data-testid="access-certification-button"]').click({
      force: true,
    });
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/responsable-certifications/certifications/654c9471-6e2e-4ff2-a5d8-2069e78ea0d6/",
    );
  });

  it("let me click on the 'access certification' button when status is VALIDE_PAR_CERTIFICATEUR and visible is false", function () {
    interceptCertifications("VALIDE_PAR_CERTIFICATEUR", false);

    cy.admin(
      "/responsable-certifications/certifications?status=VALIDE_PAR_CERTIFICATEUR&visible=false&page=1",
    );
    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationsV2ForRegistryManager");
    cy.get('[data-testid="access-certification-button"]').click({
      force: true,
    });
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/responsable-certifications/certifications/994b9bc4-e9f5-42c3-8556-f2494d11ebb4/",
    );
  });
});
