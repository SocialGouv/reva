import { stubQuery } from "../../../utils/graphql";

import certificationBPBoucher from "./fixtures/certification-bp-boucher.json";

function interceptCertification({
  withStructure,
  withCertificationAuthoritiesOfCertification,
  withCertificationRegistryManagerAssociatedToStructure,
  status,
}: {
  withStructure?: boolean;
  withCertificationAuthoritiesOfCertification?: boolean;
  withCertificationRegistryManagerAssociatedToStructure?: boolean;
  status?: string;
} = {}) {
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
    stubQuery(req, "getCertificationForUpdateCertificationPage", {
      data: {
        getCertification: {
          ...certificationBPBoucher.data.getCertification,
          status: status || certificationBPBoucher.data.getCertification.status,
          certificationAuthorities: withCertificationAuthoritiesOfCertification
            ? [
                {
                  id: "47954f7a-1148-4280-842b-01eecf8ac52d",
                  label:
                    "Ministère de l'Education Nationale et de la Jeunesse - Auvergne - Rhône-Alpes",
                },
                {
                  id: "39c45c3d-4785-4745-8f24-5cb11c47896e",
                  label:
                    "Ministère de l'Education Nationale et de la Jeunesse - Bourgogne - Franche-Comté",
                },
                {
                  id: "dd2aaae3-3d59-45a0-8448-804d3f713bda",
                  label:
                    "Ministère de l'Education Nationale et de la Jeunesse - Bretagne",
                },
              ]
            : [],
          certificationAuthorityStructure: withStructure
            ? {
                id: "0ec61d50-a202-4222-95ff-d516b9cae503",
                label: "Ministère de l'Education Nationale et de la Jeunesse",
                certificationRegistryManager:
                  withCertificationRegistryManagerAssociatedToStructure
                    ? { id: "3881b52a-0de9-460d-a228-84ee27480880" }
                    : undefined,
              }
            : undefined,
        },
      },
    });
  });
}

context("when i access the update certification page ", () => {
  it("display the page with a correct title", function () {
    interceptCertification();

    cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationForUpdateCertificationPage");

    cy.get('[data-testid="update-certification-page"]')
      .children("h1")
      .should("have.text", "BP Boucher");
  });

  context("Competence blocs summary card", () => {
    it("display the correct number of competence blocs and competences", function () {
      interceptCertification();

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      //2 competence blocs
      cy.get(
        '[data-testid="update-certification-page"] [data-testid="competence-blocs-list"] [data-testid="competence-bloc"]',
      ).should("have.length", 2);

      //4 competence for the first competence bloc
      cy.get(
        '[data-testid="update-certification-page"] [data-testid="competence-blocs-list"] [data-testid="competence-bloc"]:first-child [data-testid="competences-list"] > li',
      ).should("have.length", 4);

      //2 competence for the second competence bloc
      cy.get(
        '[data-testid="update-certification-page"] [data-testid="competence-blocs-list"] [data-testid="competence-bloc"]:nth-child(2) [data-testid="competences-list"] > li',
      ).should("have.length", 2);
    });

    it("let me click on the 'update competence bloc' button of the first competence bloc and leads me to its update page ", function () {
      interceptCertification();

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="update-certification-page"] [data-testid="competence-blocs-list"] [data-testid="competence-bloc"]:first-child [data-testid="update-competence-bloc-button"]',
      ).click();

      cy.url().should(
        "eq",
        "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/008a6fab-55ad-4412-ab17-56bc4b8e2fd0/",
      );
    });

    it("let me click on the 'add competence bloc' button and leads me to the create competence bloc page ", function () {
      interceptCertification();

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="competence-blocs-summary-card"] [data-testid="action-button"] ',
      ).click();
      cy.url().should(
        "eq",
        "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/add/",
      );
    });
  });

  context("Structure summary card", () => {
    it("display a 'to complete' badge on the certification structure summary card when the certification has no associated structure", function () {
      interceptCertification();

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="certification-structure-summary-card"] [data-testid="to-complete-badge"]',
      ).should("exist");
    });

    it("display a 'completed' badge on the certification structure summary card when the certification has an associated structure", function () {
      interceptCertification({ withStructure: true });

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="certification-structure-summary-card"] [data-testid="completed-badge"]',
      ).should("exist");
    });

    it("display the structure label when the certification has an associated structure", function () {
      interceptCertification({ withStructure: true });

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="certification-structure-summary-card"] [data-testid="certification-authority-structure-label"] dd',
      ).should(
        "have.text",
        "Ministère de l'Education Nationale et de la Jeunesse",
      );
    });

    it("display the list of certification authorities of the structure when the certification has an associated structure", function () {
      interceptCertification({
        withStructure: true,
        withCertificationAuthoritiesOfCertification: true,
      });

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="certification-structure-summary-card"] [data-testid="certification-authority-list"] > li',
      ).should("have.length", 3);
      cy.get(
        '[data-testid="certification-structure-summary-card"] [data-testid="no-certification-authority-alert"]',
      ).should("not.exist");
    });

    it("display an alert  when the certification has an associated structure but no certification authorities associated with it", function () {
      interceptCertification({ withStructure: true });

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="certification-structure-summary-card"] [data-testid="certification-authority-list"]',
      ).should("not.exist");
      cy.get(
        '[data-testid="certification-structure-summary-card"] [data-testid="no-certification-authority-alert"]',
      ).should("exist");
    });

    it("display an alert  when the certification has an associated structure but no certification registry manager associated with it", function () {
      interceptCertification({
        withStructure: true,
      });

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="certification-structure-summary-card"] [data-testid="no-certification-registry-manager-alert"]',
      ).should("exist");
    });

    it("display no alert  when the certification has an associated structure and a certification registry manager associated with it", function () {
      interceptCertification({
        withStructure: true,
        withCertificationRegistryManagerAssociatedToStructure: true,
      });

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="certification-structure-summary-card"] [data-testid="no-certification-registry-manager-alert"]',
      ).should("not.exist");
    });

    it("let me click on the 'completer' button and redirect me to the structure page", function () {
      interceptCertification();

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="certification-structure-summary-card"] [data-testid="action-button"] ',
      ).click();
      cy.url().should(
        "eq",
        "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/structure/",
      );
    });

    it("let me check if buttons 'envoyer' and 'réinitialiser' are visible is status equal to 'BROUILLON'", function () {
      interceptCertification({ status: "BROUILLON" });

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get('[data-testid="button-send"]').should("exist");
      cy.get('[data-testid="button-reset"]').should("exist");
    });

    it("let me check if buttons 'envoyer' and 'réinitialiser' are no more visible if status different from 'BROUILLON'", function () {
      interceptCertification({ status: "A_VALIDER_PAR_CERTIFICATEUR" });

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get('[data-testid="button-send"]').should("not.exist");
      cy.get('[data-testid="button-reset"]').should("not.exist");
    });
  });

  context("Prerequisites summary card", () => {
    it("display the correct number of prerequisites", function () {
      interceptCertification();

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="update-certification-page"] [data-testid="prerequisites-summary-card"] [data-testid="prerequisite-list"] [data-testid="prerequisite"]',
      ).should("have.length", 2);
    });

    it("let me click on the 'update prerequisites' button and leads me to the prerequisites update page", function () {
      interceptCertification();

      cy.admin("/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b");
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationForUpdateCertificationPage");

      cy.get(
        '[data-testid="update-certification-page"] [data-testid="prerequisites-summary-card"]  [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "eq",
        "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/prerequisites/",
      );
    });
  });
});
