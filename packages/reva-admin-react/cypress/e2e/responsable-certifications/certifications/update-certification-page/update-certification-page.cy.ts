import { CertificationStatus } from "@/graphql/generated/graphql";

import { stubQuery } from "../../../../utils/graphql";

import certificationBPBoucher from "./fixtures/certification-bp-boucher.json";

function interceptCertification({
  withPrerequisites,
  withDescription,
  withadditionalInfo,
  withStatus,
}: {
  withPrerequisites?: boolean;
  withDescription?: boolean;
  withadditionalInfo?: boolean;
  withStatus?: CertificationStatus;
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
            ...(() =>
              withDescription
                ? {
                    availableAt: 1688162400000,
                    rncpExpiresAt: 1688162500000,
                    juryTypeMiseEnSituationProfessionnelle: null,
                    juryTypeSoutenanceOrale: "PRESENTIEL",
                    juryFrequency: "MONTHLY",
                    juryFrequencyOther: null,
                    juryPlace: null,
                    juryEstimatedCost: 10.0,
                  }
                : {})(),
            additionalInfo: withadditionalInfo
              ? {
                  linkToReferential: "https://www.google.fr",
                  dossierDeValidationTemplate: {
                    name: "Template de dossier de validation",
                    previewUrl: "https://www.google.fr",
                  },
                  additionalDocuments: [],
                }
              : undefined,
            status:
              withStatus || certificationBPBoucher.data.getCertification.status,
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
      '[data-testid="certification-registry-manager-update-certification-page"]',
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
        '[data-testid="certification-registry-manager-update-certification-page"] [data-testid="competence-blocs-list"] [data-testid="competence-bloc"]',
      ).should("have.length", 2);

      //4 competence for the first competence bloc
      cy.get(
        '[data-testid="certification-registry-manager-update-certification-page"] [data-testid="competence-blocs-list"] [data-testid="competence-bloc"]:first-child [data-testid="competences-list"] > li',
      ).should("have.length", 4);

      //2 competence for the second competence bloc
      cy.get(
        '[data-testid="certification-registry-manager-update-certification-page"] [data-testid="competence-blocs-list"] [data-testid="competence-bloc"]:nth-child(2) [data-testid="competences-list"] > li',
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
        '[data-testid="certification-registry-manager-update-certification-page"] [data-testid="competence-blocs-list"] [data-testid="competence-bloc"]:first-child [data-testid="update-competence-bloc-button"]',
      ).click();

      cy.url().should(
        "eq",
        "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/008a6fab-55ad-4412-ab17-56bc4b8e2fd0/",
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
        '[data-testid="prerequisites-summary-card"] [data-testid="no-prerequisite-message"]',
      ).should("exist");
    });

    it("display a list of prerequisites if the certification has them", function () {
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
        '[data-testid="prerequisites-summary-card"] [data-testid="prerequisite-list"] > li',
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
        '[data-testid="prerequisites-summary-card"] [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "eq",
        "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/prerequisites/",
      );
    });
  });

  context("additional info summary card", () => {
    it("display a default message when the certification has no additional info", function () {
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
        '[data-testid="additional-info-summary-card"] [data-testid="no-additional-info-message"]',
      ).should("exist");
      cy.get(
        '[data-testid="additional-info-summary-card"] [data-testid="additional-info-content"]',
      ).should("not.exist");
    });

    it("display the additional info if the certification has them", function () {
      interceptCertification({ withadditionalInfo: true });

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
        '[data-testid="additional-info-summary-card"] [data-testid="additional-info-content"]',
      ).should("exist");
      cy.get(
        '[data-testid="additional-info-summary-card"] [data-testid="no-additional-info-message"]',
      ).should("not.exist");
    });

    it("let me click on the 'update' button of the addtional info summary card and leads me to the correct page", function () {
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
        '[data-testid="additional-info-summary-card"] [data-testid="action-button"]',
      ).click();

      cy.url().should(
        "eq",
        "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/additional-info/",
      );
    });
  });

  context("validate certification", () => {
    it("validate button should be disable if description has not been complete", function () {
      interceptCertification({ withadditionalInfo: true });

      cy.admin(
        "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
      );

      cy.get('[data-testid="form-buttons"]').should("exist");
      cy.get('[data-testid="form-buttons"]')
        .children("div")
        .children("button")
        .should("be.disabled");
    });

    it("validate button should be enabled if description and additional information sections are complete", function () {
      interceptCertification({
        withDescription: true,
        withadditionalInfo: true,
      });

      cy.admin(
        "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
      );

      cy.get('[data-testid="form-buttons"]').should("exist");
      cy.get('[data-testid="form-buttons"]')
        .children("div")
        .children("button")
        .should("not.be.disabled");
    });

    it.skip("validate button should not be visible if certification has been validate", function () {
      interceptCertification({
        withDescription: true,
        withadditionalInfo: true,
        withStatus: "VALIDE_PAR_CERTIFICATEUR",
      });

      cy.admin(
        "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
      );

      cy.get('[data-testid="form-buttons"]').should("not.exist");
    });
  });

  const validStatusForReplacement: CertificationStatus[] = [
    "VALIDE_PAR_CERTIFICATEUR",
    "INACTIVE",
  ];

  context("replace certification", () => {
    validStatusForReplacement.forEach((withStatus) =>
      it(`should display the replace certification button and navigate to replace page when clicked when status is ${withStatus}`, function () {
        interceptCertification({ withStatus });

        cy.certificateurRegistryManager(
          "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
        );
        cy.wait("@activeFeaturesForConnectedUser");
        cy.wait("@getOrganismForAAPVisibilityCheck");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait(
          "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
        );

        cy.get('[data-testid="replace-certification-button"]').click();

        cy.url().should(
          "eq",
          "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/replace/",
        );
      }),
    );

    it("should not display the replace certification button when the certification has to be validated", function () {
      interceptCertification({ withStatus: "A_VALIDER_PAR_CERTIFICATEUR" });
      cy.certificateurRegistryManager(
        "/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait(
        "@getCertificationForCertificationRegistryManagerUpdateCertificationPage",
      );

      cy.get(
        '[data-testid="certification-registry-manager-update-certification-page"]',
      ).should("exist");

      cy.get('[data-testid="replace-certification-button"]').should(
        "not.exist",
      );
    });
  });
});
