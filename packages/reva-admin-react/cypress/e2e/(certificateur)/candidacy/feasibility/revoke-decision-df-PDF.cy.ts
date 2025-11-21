import { stubMutation, stubQuery } from "../../../../utils/graphql";
import candidacyInfoForLayout from "../../fixtures/candidacy-info-for-layout.json";
import dossierDeValidationCountByCategory from "../../fixtures/dossier-de-validation-count-by-category.json";
import feasibilityCountByCategory from "../../fixtures/feasibility-count-by-category.json";
import juryCountByCategory from "../../fixtures/jury-count-by-category.json";
import maisonMereCGU from "../../fixtures/maison-mere-cgu.json";

import candidacyPdfAdmissible from "./fixtures/feasibility-pdf-admissible.json";
import candidacyPdfComplete from "./fixtures/feasibility-pdf-complete.json";
import candidacyPdfIncomplete from "./fixtures/feasibility-pdf-incomplete.json";
import candidacyPdfRejected from "./fixtures/feasibility-pdf-rejected.json";
import revokeDecisionResponse from "./fixtures/revoke-decision-response.json";

describe("Revoke PDF Feasibility Decision", () => {
  const candidacyUrl =
    "/candidacies/46206f6b-0a59-4478-9338-45e3a8d968e4/feasibility";

  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: [],
        },
      });

      stubQuery(req, "getMaisonMereCGUQuery", maisonMereCGU);

      stubQuery(
        req,
        "getCandidacyWithCandidateInfoForLayout",
        candidacyInfoForLayout,
      );

      stubQuery(
        req,
        "getFeasibilityCountByCategory",
        feasibilityCountByCategory,
      );

      stubQuery(
        req,
        "getDossierDeValidationCountByCategory",
        dossierDeValidationCountByCategory,
      );

      stubQuery(req, "getJuryCountByCategory", juryCountByCategory);

      stubQuery(
        req,
        "getCandidacyWithFeasibilityQuery",
        "candidacy/candidacy-pdf-format.json",
      );

      stubQuery(req, "candidacy_canAccessCandidacy", {
        data: { candidacy_canAccessCandidacy: true },
      });
    });
  });

  context("As Certificateur", () => {
    ["ADMISSIBLE", "REJECTED"].forEach((decision) => {
      it(`should NOT display the revoke decision button for certificateur when decision is ${decision}`, () => {
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "getCandidacyWithFeasibilityUploadedPdfQuery",
            decision === "ADMISSIBLE"
              ? candidacyPdfAdmissible
              : candidacyPdfRejected,
          );
        });

        cy.certificateur(candidacyUrl);

        cy.wait([
          "@activeFeaturesForConnectedUser",
          "@getMaisonMereCGUQuery",
          "@getCandidacyWithCandidateInfoForLayout",
          "@getFeasibilityCountByCategory",
          "@getDossierDeValidationCountByCategory",
          "@getJuryCountByCategory",
          "@getCandidacyWithFeasibilityQuery",
          "@candidacy_canAccessCandidacy",
          "@getCandidacyWithFeasibilityUploadedPdfQuery",
        ]);

        cy.get(
          `[data-testid="feasibility-page-pdf-${decision.toLowerCase()}"]`,
        ).should("exist");

        cy.get("button").contains("Annuler la décision").should("not.exist");
      });
    });
  });

  context("As Admin", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubMutation(
          req,
          "revokeCertificationAuthorityDecisionPdf",
          revokeDecisionResponse,
        );
      });
    });

    ["ADMISSIBLE", "REJECTED"].forEach((decision) => {
      it(`should display the revoke decision button for admin when decision is ${decision}`, () => {
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "getCandidacyWithFeasibilityUploadedPdfQuery",
            decision === "ADMISSIBLE"
              ? candidacyPdfAdmissible
              : candidacyPdfRejected,
          );
        });

        cy.admin(candidacyUrl);

        cy.wait([
          "@activeFeaturesForConnectedUser",
          "@getMaisonMereCGUQuery",
          "@getCandidacyWithCandidateInfoForLayout",
          "@getFeasibilityCountByCategory",
          "@getDossierDeValidationCountByCategory",
          "@getJuryCountByCategory",
          "@getCandidacyWithFeasibilityQuery",
          "@candidacy_canAccessCandidacy",
          "@getCandidacyWithFeasibilityUploadedPdfQuery",
        ]);

        cy.get(
          `[data-testid="feasibility-page-pdf-${decision.toLowerCase()}"]`,
        ).should("exist");

        cy.get("button").contains("Annuler la décision").should("be.visible");
      });
    });

    it("should allow admin to revoke a decision with comment", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "getCandidacyWithFeasibilityUploadedPdfQuery",
          candidacyPdfAdmissible,
        );
      });

      cy.admin(candidacyUrl);

      cy.wait("@getCandidacyWithFeasibilityQuery");
      cy.wait("@getCandidacyWithFeasibilityUploadedPdfQuery");

      cy.get(`[data-testid="feasibility-page-pdf-admissible"]`).should("exist");

      cy.get("button")
        .contains("Annuler la décision")
        .should("be.visible")
        .click();

      cy.get("#revoke-feasibility-decision").should("be.visible");

      cy.get("#revoke-feasibility-decision textarea").type("erreur de saisie");

      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "getCandidacyWithFeasibilityUploadedPdfQuery",
          candidacyPdfComplete,
        );
      });

      cy.get("#revoke-feasibility-decision button")
        .contains("Confirmer")
        .click();

      cy.wait("@revokeCertificationAuthorityDecisionPdf");
      cy.wait("@getCandidacyWithFeasibilityUploadedPdfQuery");

      cy.get(`[data-testid="feasibility-page-pdf-complete"]`).should("exist");
    });

    ["COMPLETE", "INCOMPLETE"].forEach((decision) => {
      it(`should NOT display revoke button for ${decision} decisions`, () => {
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "getCandidacyWithFeasibilityUploadedPdfQuery",
            decision === "COMPLETE"
              ? candidacyPdfComplete
              : candidacyPdfIncomplete,
          );
        });

        cy.admin(candidacyUrl);

        cy.wait([
          "@activeFeaturesForConnectedUser",
          "@getMaisonMereCGUQuery",
          "@getCandidacyWithCandidateInfoForLayout",
          "@getFeasibilityCountByCategory",
          "@getDossierDeValidationCountByCategory",
          "@getJuryCountByCategory",
          "@getCandidacyWithFeasibilityQuery",
          "@candidacy_canAccessCandidacy",
          "@getCandidacyWithFeasibilityUploadedPdfQuery",
        ]);

        cy.get(
          `[data-testid="feasibility-page-pdf-${decision.toLowerCase()}"]`,
        ).should("exist");

        cy.get("button").contains("Annuler la décision").should("not.exist");
      });
    });

    ["DOSSIER_DE_VALIDATION_ENVOYE", "DOSSIER_DE_VALIDATION_SIGNALE"].forEach(
      (status) => {
        it(`should NOT display revoke button when candidacy status is ${status}`, () => {
          const modifiedFixture = structuredClone(candidacyPdfAdmissible);
          modifiedFixture.data.getCandidacyById.status = status;

          cy.intercept("POST", "/api/graphql", (req) => {
            stubQuery(
              req,
              "getCandidacyWithFeasibilityUploadedPdfQuery",
              modifiedFixture,
            );
          });

          cy.admin(candidacyUrl);

          cy.wait([
            "@activeFeaturesForConnectedUser",
            "@getMaisonMereCGUQuery",
            "@getCandidacyWithCandidateInfoForLayout",
            "@getFeasibilityCountByCategory",
            "@getDossierDeValidationCountByCategory",
            "@getJuryCountByCategory",
            "@getCandidacyWithFeasibilityQuery",
            "@candidacy_canAccessCandidacy",
            "@getCandidacyWithFeasibilityUploadedPdfQuery",
          ]);

          cy.get(`[data-testid="feasibility-page-pdf-admissible"]`).should(
            "exist",
          );

          cy.get("button").contains("Annuler la décision").should("not.exist");
        });
      },
    );
  });
});
