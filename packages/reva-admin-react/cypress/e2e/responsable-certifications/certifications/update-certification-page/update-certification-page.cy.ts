import { stubQuery } from "../../../../utils/graphql";
import certificationBPBoucher from "./fixtures/certification-bp-boucher.json";

function interceptCertification({
  withPrerequisites,
}: {
  withPrerequisites?: boolean;
}) {
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
      "getCertificationForCertificationRegistryManagerUpdateCertificationPage",
      {
        data: {
          getCertification: {
            ...certificationBPBoucher.data.getCertification,
            prerequisites: withPrerequisites
              ? [
                  {
                    id: "71ba9727-eb22-47a1-8731-89263348bf63",
                    label: "Prerequisite 1",
                  },
                  {
                    id: "2a7f19b0-510f-44cc-b0f6-8648ea0f6cd1",
                    label: "Prerequisite 2",
                  },
                ]
              : [],
          },
        },
      },
    );
  });
}

context("when i access the update certification page ", () => {
  it("display the page with a correct title", function () {
    interceptCertification({});

    cy.admin(
      "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
    );

    cy.get(
      '[data-test="certification-registry-manager-update-certification-page"]',
    )
      .children("h1")
      .should("have.text", "37310 - BP Boucher");
  });

  context("Competence blocs summary card", () => {
    it("display the correct number of competence blocs and competences", function () {
      interceptCertification({});

      cy.admin(
        "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
      );

      //2 competence blocs
      cy.get(
        '[data-test="certification-registry-manager-update-certification-page"] [data-test="competence-blocs-list"] [data-test="competence-bloc"]',
      ).should("have.length", 2);

      //4 competence for the first competence bloc
      cy.get(
        '[data-test="certification-registry-manager-update-certification-page"] [data-test="competence-blocs-list"] [data-test="competence-bloc"]:first-child [data-test="competences-list"] > li',
      ).should("have.length", 4);

      //2 competence for the second competence bloc
      cy.get(
        '[data-test="certification-registry-manager-update-certification-page"] [data-test="competence-blocs-list"] [data-test="competence-bloc"]:nth-child(2) [data-test="competences-list"] > li',
      ).should("have.length", 2);
    });

    it("let me click on the 'update competence bloc' button of the first competence bloc and leads me to its update page ", function () {
      interceptCertification({});

      cy.admin(
        "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
      );

      cy.get(
        '[data-test="certification-registry-manager-update-certification-page"] [data-test="competence-blocs-list"] [data-test="competence-bloc"]:first-child [data-test="update-competence-bloc-button"]',
      ).click();

      cy.url().should(
        "eq",
        "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/008a6fab-55ad-4412-ab17-56bc4b8e2fd0/",
      );
    });

    it("let me click on the 'add competence bloc' button and leads me to the create competence bloc page ", function () {
      interceptCertification({});

      cy.admin(
        "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
      );

      cy.get(
        '[data-test="competence-blocs-summary-card"] [data-test="action-button"] ',
      ).click();
      cy.url().should(
        "eq",
        "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/add/",
      );
    });
  });
  context("prerequisites summary card", () => {
    it("display a default message when the certification has no prerequisite", function () {
      interceptCertification({});

      cy.admin(
        "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
      );

      cy.get(
        '[data-test="prerequisites-summary-card"] [data-test="no-prerequisite-message"]',
      ).should("exist");
    });
    it("display a lost pf prerequisites if the certification has them", function () {
      interceptCertification({ withPrerequisites: true });

      cy.admin(
        "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
      );

      cy.get(
        '[data-test="prerequisites-summary-card"] [data-test="prerequisite-list"] > li',
      ).should("have.length", 2);
    });

    it("let me click on the 'update' button of the prerequisites summary card and leads me to the correct page", function () {
      interceptCertification({ withPrerequisites: true });

      cy.admin(
        "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
      );

      cy.get(
        '[data-test="prerequisites-summary-card"] [data-test="action-button"]',
      ).click();

      cy.url().should(
        "eq",
        "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/prerequisites/",
      );
    });
  });
});