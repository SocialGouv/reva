import { stubMutation, stubQuery } from "../../../../utils/graphql";
import candidacyInfoForLayout from "../../fixtures/candidacy-info-for-layout.json";
import maisonMereCGU from "../../fixtures/maison-mere-cgu.json";

import feasibilityDematerializedAdmissible from "./fixtures/feasibility-dematerialized-admissible.json";
import feasibilityDematerializedComplete from "./fixtures/feasibility-dematerialized-complete.json";
import feasibilityDematerializedIncomplete from "./fixtures/feasibility-dematerialized-incomplete.json";
import feasibilityDematerializedRejected from "./fixtures/feasibility-dematerialized-rejected.json";
import revokeDecisionResponse from "./fixtures/revoke-decision-response.json";

const fixtureMap: Record<string, object> = {
  ADMISSIBLE: feasibilityDematerializedAdmissible,
  REJECTED: feasibilityDematerializedRejected,
  COMPLETE: feasibilityDematerializedComplete,
  INCOMPLETE: feasibilityDematerializedIncomplete,
};

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
        "getCandidacyWithFeasibilityQuery",
        "candidacy/candidacy.json",
      );

      stubQuery(req, "candidacy_canAccessCandidacy", {
        data: { candidacy_canAccessCandidacy: true },
      });
      stubQuery(req, "getCertificationAuthorityStructureCGUQuery", {
        data: {
          account_getAccountForConnectedUser: {
            certificationRegistryManager: null,
            certificationAuthority: null,
            certificationAuthorityLocalAccount: null,
          },
        },
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
            fixtureMap[decision],
          );
        });

        cy.certificateur(candidacyUrl);

        cy.wait([
          "@activeFeaturesForConnectedUser",
          "@getMaisonMereCGUQuery",
          "@getCandidacyWithCandidateInfoForLayout",
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

    ["ADMISSIBLE", "REJECTED", "COMPLETE"].forEach((decision) => {
      it(`should display the revoke decision button for admin when decision is ${decision}`, () => {
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "feasibilityGetActiveFeasibilityByCandidacyId",
            fixtureMap[decision],
          );
        });

        cy.admin(candidacyUrl);

        cy.wait([
          "@activeFeaturesForConnectedUser",
          "@getMaisonMereCGUQuery",
          "@getCandidacyWithCandidateInfoForLayout",
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

    it("should display the revoke decision button for admin when decision is INCOMPLETE and feature flag is active", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: {
            activeFeaturesForConnectedUser: ["ADMIN_REVOKE_DF_INCOMPLETE"],
          },
        });
        stubQuery(
          req,
          "feasibilityGetActiveFeasibilityByCandidacyId",
          fixtureMap["INCOMPLETE"],
        );
      });

      cy.admin(candidacyUrl);

      cy.wait([
        "@activeFeaturesForConnectedUser",
        "@getMaisonMereCGUQuery",
        "@getCandidacyWithCandidateInfoForLayout",
        "@getCandidacyWithFeasibilityQuery",
        "@candidacy_canAccessCandidacy",
        "@feasibilityGetActiveFeasibilityByCandidacyId",
      ]);

      cy.get(
        `[data-testid="feasibility-page-dematerialized-incomplete"]`,
      ).should("exist");

      cy.get("button").contains("Annuler la décision").should("be.visible");
    });

    it("should NOT display the revoke decision button for admin when decision is INCOMPLETE and feature flag is inactive", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "feasibilityGetActiveFeasibilityByCandidacyId",
          fixtureMap["INCOMPLETE"],
        );
      });

      cy.admin(candidacyUrl);

      cy.wait([
        "@activeFeaturesForConnectedUser",
        "@getMaisonMereCGUQuery",
        "@getCandidacyWithCandidateInfoForLayout",
        "@getCandidacyWithFeasibilityQuery",
        "@candidacy_canAccessCandidacy",
        "@feasibilityGetActiveFeasibilityByCandidacyId",
      ]);

      cy.get(
        `[data-testid="feasibility-page-dematerialized-incomplete"]`,
      ).should("exist");

      cy.get("button").contains("Annuler la décision").should("not.exist");
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
