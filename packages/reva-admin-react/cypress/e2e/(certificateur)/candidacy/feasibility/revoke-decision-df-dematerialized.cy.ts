import { stubMutation, stubQuery } from "../../../../utils/graphql";
import candidacyInfoForLayout from "../../fixtures/candidacy-info-for-layout.json";
import dossierDeValidationCountByCategory from "../../fixtures/dossier-de-validation-count-by-category.json";
import feasibilityCountByCategory from "../../fixtures/feasibility-count-by-category.json";
import juryCountByCategory from "../../fixtures/jury-count-by-category.json";
import maisonMereCGU from "../../fixtures/maison-mere-cgu.json";

import feasibilityDematerializedAdmissible from "./fixtures/feasibility-dematerialized-admissible.json";
import feasibilityDematerializedComplete from "./fixtures/feasibility-dematerialized-complete.json";
import feasibilityDematerializedIncomplete from "./fixtures/feasibility-dematerialized-incomplete.json";
import feasibilityDematerializedRejected from "./fixtures/feasibility-dematerialized-rejected.json";
import revokeDecisionResponse from "./fixtures/revoke-decision-response.json";

describe("Revoke Dematerialized Feasibility Decision", () => {
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
        "candidacy/candidacy.json",
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
            "feasibilityGetActiveFeasibilityByCandidacyId",
            decision === "ADMISSIBLE"
              ? feasibilityDematerializedAdmissible
              : feasibilityDematerializedRejected,
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
          "@feasibilityGetActiveFeasibilityByCandidacyId",
        ]);

        cy.get(
          `[data-testid="feasibility-page-dematerialized-${decision.toLowerCase()}"]`,
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
          "revokeCertificationAuthorityDecision",
          revokeDecisionResponse,
        );
      });
    });

    ["ADMISSIBLE", "REJECTED"].forEach((decision) => {
      it(`should display the revoke decision button for admin when decision is ${decision}`, () => {
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "feasibilityGetActiveFeasibilityByCandidacyId",
            decision === "ADMISSIBLE"
              ? feasibilityDematerializedAdmissible
              : feasibilityDematerializedRejected,
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
          "@feasibilityGetActiveFeasibilityByCandidacyId",
        ]);

        cy.get(
          `[data-testid="feasibility-page-dematerialized-${decision.toLowerCase()}"]`,
        ).should("exist");

        cy.get("button").contains("Annuler la décision").should("be.visible");
      });
    });

    it("should allow admin to revoke a decision with comment", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "feasibilityGetActiveFeasibilityByCandidacyId",
          feasibilityDematerializedAdmissible,
        );
      });

      cy.admin(candidacyUrl);

      cy.wait("@getCandidacyWithFeasibilityQuery");
      cy.wait("@feasibilityGetActiveFeasibilityByCandidacyId");

      cy.get(
        `[data-testid="feasibility-page-dematerialized-admissible"]`,
      ).should("exist");

      cy.get("button")
        .contains("Annuler la décision")
        .should("be.visible")
        .click();

      cy.get("#revoke-feasibility-decision").should("be.visible");

      cy.get("#revoke-feasibility-decision textarea").type("erreur de saisie");

      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "feasibilityGetActiveFeasibilityByCandidacyId",
          feasibilityDematerializedComplete,
        );
      });

      cy.get("#revoke-feasibility-decision button")
        .contains("Confirmer")
        .click();

      cy.wait("@revokeCertificationAuthorityDecision");
      cy.wait("@feasibilityGetActiveFeasibilityByCandidacyId");

      cy.get(`[data-testid="feasibility-page-dematerialized-complete"]`).should(
        "exist",
      );
    });

    ["COMPLETE", "INCOMPLETE"].forEach((decision) => {
      it(`should NOT display revoke button for ${decision} decisions`, () => {
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "feasibilityGetActiveFeasibilityByCandidacyId",
            decision === "COMPLETE"
              ? feasibilityDematerializedComplete
              : feasibilityDematerializedIncomplete,
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
          "@feasibilityGetActiveFeasibilityByCandidacyId",
        ]);

        cy.get(
          `[data-testid="feasibility-page-dematerialized-${decision.toLowerCase()}"]`,
        ).should("exist");

        cy.get("button").contains("Annuler la décision").should("not.exist");
      });
    });

    ["DOSSIER_DE_VALIDATION_ENVOYE", "DOSSIER_DE_VALIDATION_SIGNALE"].forEach(
      (status) => {
        it(`should NOT display revoke button when candidacy status is ${status}`, () => {
          const fixture = structuredClone(feasibilityDematerializedAdmissible);
          fixture.data.feasibility_getActiveFeasibilityByCandidacyId.candidacy.status =
            status;

          cy.intercept("POST", "/api/graphql", (req) => {
            stubQuery(
              req,
              "feasibilityGetActiveFeasibilityByCandidacyId",
              fixture,
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
            "@feasibilityGetActiveFeasibilityByCandidacyId",
          ]);

          cy.get(
            `[data-testid="feasibility-page-dematerialized-admissible"]`,
          ).should("exist");

          cy.get("button").contains("Annuler la décision").should("not.exist");
        });
      },
    );
  });
});
