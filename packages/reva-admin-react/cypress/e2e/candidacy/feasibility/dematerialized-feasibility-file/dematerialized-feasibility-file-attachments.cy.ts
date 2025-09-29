const FILE_TITLES = {
  ID_CARD: "Pièce d'identité",
  EQUIVALENCE_PROOF: "Justificatif d'équivalence ou de dispense (optionnel)",
  TRAINING_CERTIFICATE: "Attestation ou certificat de formation (optionnel)",
  ADDITIONAL_FILE: "Pièce jointe supplémentaire",
} as const;

import { stubQuery } from "../../../../utils/graphql";

function visitFeasibilityAttachments() {
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
      "getOrganismForAAPVisibilityCheck",
      "visibility/organism.json",
    );
    stubQuery(req, "getAccountInfo", "account/gestionnaire-info.json");

    stubQuery(
      req,
      "getCandidacyMenuAndCandidateInfos",
      "candidacy/candidacy-menu-dff.json",
    );

    stubQuery(
      req,
      "feasibilityWithDematerializedFeasibilityFileAttachmentsByCandidacyId",
      "feasibility/dematerialized-feasibility-file-attachments.json",
    );

    stubQuery(
      req,
      "candidacy_canAccessCandidacy",
      "security/can-access-candidacy.json",
    );
  });

  cy.collaborateur(
    "/candidacies/57bf364b-8c8b-4ff4-889b-66917e26d7d0/feasibility-aap/attachments",
  );

  cy.wait([
    "@activeFeaturesForConnectedUser",
    "@getMaisonMereCGUQuery",
    "@getOrganismForAAPVisibilityCheck",
    "@getAccountInfo",
    "@getCandidacyMenuAndCandidateInfos",
    "@feasibilityWithDematerializedFeasibilityFileAttachmentsByCandidacyId",
    "@candidacy_canAccessCandidacy",
  ]);
}

describe("Dematerialized Feasibility File - Attachments Page", () => {
  context("Initial form state", () => {
    it("should display an empty form with enabled submit button", () => {
      visitFeasibilityAttachments();

      cy.get('[data-test="form-buttons"]').should("exist");
    });
  });

  context("Document upload and preview functionality", () => {
    it("should handle ID card upload with preview controls (required)", () => {
      visitFeasibilityAttachments();

      cy.get(
        `[data-test="feasibility-files-preview-${FILE_TITLES.ID_CARD}"]`,
      ).should("not.exist");

      cy.get('[data-test="id-card-upload"]').within(() => {
        cy.get('input[type="file"]').selectFile(
          "cypress/fixtures/files/test-file.pdf",
          { force: true },
        );
      });

      cy.get(`[data-test="feasibility-files-preview-${FILE_TITLES.ID_CARD}"]`)
        .should("exist")
        .within(() => {
          cy.get("iframe").should("be.visible");
          cy.get(
            `[data-test="feasibility-files-preview-${FILE_TITLES.ID_CARD}-toggle"]`,
          ).should("exist");
        });

      cy.get(
        `[data-test="feasibility-files-preview-${FILE_TITLES.ID_CARD}-toggle"]`,
      ).click();
      cy.get("iframe").should("not.be.visible");

      cy.get(
        `[data-test="feasibility-files-preview-${FILE_TITLES.ID_CARD}-toggle"]`,
      ).click();
      cy.get("iframe").should("be.visible");

      cy.get('[data-test="form-buttons"]')
        .should("exist")
        .within(() => {
          cy.get("button").should("not.be.disabled");
        });
    });

    it("should handle equivalence proof upload with preview (optional)", () => {
      visitFeasibilityAttachments();

      cy.get('[data-test="equivalence-proof-upload"]').within(() => {
        cy.get('input[type="file"]').selectFile(
          "cypress/fixtures/files/test-file.pdf",
          { force: true },
        );
      });

      cy.get(
        `[data-test="feasibility-files-preview-${FILE_TITLES.EQUIVALENCE_PROOF}"]`,
      )
        .should("exist")
        .within(() => {
          cy.get("iframe").should("be.visible");
        });
    });

    it("should handle training certificate upload with preview (optional)", () => {
      visitFeasibilityAttachments();

      cy.get('[data-test="training-certificate-upload"]').within(() => {
        cy.get('input[type="file"]').selectFile(
          "cypress/fixtures/files/test-file.pdf",
          { force: true },
        );
      });

      cy.get(
        `[data-test="feasibility-files-preview-${FILE_TITLES.TRAINING_CERTIFICATE}"]`,
      )
        .should("exist")
        .within(() => {
          cy.get("iframe").should("be.visible");
        });
    });

    it("should verify optional files start as non-existent", () => {
      visitFeasibilityAttachments();

      cy.get(
        `[data-test="feasibility-files-preview-${FILE_TITLES.EQUIVALENCE_PROOF}"]`,
      ).should("not.exist");
      cy.get(
        `[data-test="feasibility-files-preview-${FILE_TITLES.TRAINING_CERTIFICATE}"]`,
      ).should("not.exist");
    });
  });

  context("Additional files management", () => {
    it("should allow adding and removing additional files", () => {
      visitFeasibilityAttachments();

      cy.get('[data-test="add-additional-file-button"]').click();

      cy.get('[data-test="additional-file-0"]')
        .should("exist")
        .within(() => {
          cy.get('[data-test="delete-file-button"]')
            .should("be.visible")
            .click();
        });

      cy.get('[data-test="additional-file-0"]').should("not.exist");
    });

    it("should enforce maximum limit of 8 additional files", () => {
      visitFeasibilityAttachments();

      cy.get('[data-test="add-additional-file-button"]')
        .should("exist")
        .click();

      cy.get('[data-test="add-additional-file-button"]')
        .should("exist")
        .click();

      cy.get('[data-test="add-additional-file-button"]')
        .should("exist")
        .click();

      cy.get('[data-test="add-additional-file-button"]')
        .should("exist")
        .click();

      cy.get('[data-test="add-additional-file-button"]')
        .should("exist")
        .click();

      cy.get('[data-test="add-additional-file-button"]')
        .should("exist")
        .click();

      cy.get('[data-test="add-additional-file-button"]')
        .should("exist")
        .click();

      cy.get('[data-test="add-additional-file-button"]')
        .should("exist")
        .click();

      cy.get('[data-test="add-additional-file-button"]').should("not.exist");
    });
  });

  context("Navigation", () => {
    it("should provide navigation back to feasibility summary", () => {
      visitFeasibilityAttachments();

      cy.get('[data-test="back-button"]').click();

      cy.url().should("include", "/feasibility-aap");
    });
  });
});
