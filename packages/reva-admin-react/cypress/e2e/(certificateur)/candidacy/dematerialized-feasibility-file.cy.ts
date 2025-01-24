import { stubQuery } from "../../../utils/graphql";

interface CandidacyContestation {
  certificationAuthorityContestationDecision: string;
  contestationSentAt?: number;
}

const DATE_NOW = Date.now();

function visitDematerializedFeasibility({
  isCaduque = false,
  lastActivityDate = DATE_NOW,
  candidacyContestationsCaducite = [] as CandidacyContestation[],
  activeFeatures = ["candidacy_actualisation"],
} = {}) {
  cy.fixture("feasibility/dematerialized-feasibility-file.json").then(
    (feasibility) => {
      cy.fixture("features/active-features.json").then((features) => {
        features.data.activeFeaturesForConnectedUser = activeFeatures;

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "activeFeaturesForConnectedUser", features);
          stubQuery(
            req,
            "getCandidacyWithCandidateInfoForLayout",
            "candidacy/candidacy.json",
          );
          stubQuery(
            req,
            "getCandidacyWithFeasibilityQuery",
            "candidacy/candidacy.json",
          );
          stubQuery(req, "feasibilityGetActiveFeasibilityByCandidacyId", {
            data: {
              feasibility_getActiveFeasibilityByCandidacyId: {
                ...feasibility.data
                  .feasibility_getActiveFeasibilityByCandidacyId,
                candidacy: {
                  ...feasibility.data
                    .feasibility_getActiveFeasibilityByCandidacyId.candidacy,
                  isCaduque,
                  lastActivityDate,
                  candidacyContestationsCaducite,
                },
              },
            },
          });
        });
      });
    },
  );

  cy.certificateur(
    "/candidacies/1b0fa8e3-7ac3-47db-8df5-404517a83d35/feasibility",
  );

  cy.wait([
    "@activeFeaturesForConnectedUser",
    "@getCandidacyWithCandidateInfoForLayout",
    "@getCandidacyWithFeasibilityQuery",
    "@feasibilityGetActiveFeasibilityByCandidacyId",
  ]);
}

describe("Dematerialized Feasibility File as Certificateur", () => {
  context("Default state", () => {
    it("should not display any caducite related banners for non-caduque candidacy", () => {
      visitDematerializedFeasibility({
        isCaduque: false,
        candidacyContestationsCaducite: [],
      });
      cy.get('[data-test="banner-is-caduque"]').should("not.exist");
      cy.get('[data-test="banner-caducite-confirmed"]').should("not.exist");
      cy.get('[data-test="banner-pending-caducite-contestation"]').should(
        "not.exist",
      );
    });
  });

  context("Feature flag behavior", () => {
    it("should not display any caducite related banners when feature flag is disabled", () => {
      visitDematerializedFeasibility({
        isCaduque: true,
        candidacyContestationsCaducite: [
          {
            certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
          },
        ],
        activeFeatures: [],
      });
      cy.get('[data-test="banner-is-caduque"]').should("not.exist");
      cy.get('[data-test="banner-caducite-confirmed"]').should("not.exist");
      cy.get('[data-test="banner-pending-caducite-contestation"]').should(
        "not.exist",
      );
    });
  });

  context("Candidacy caducite", () => {
    context("Candidacy is caduque", () => {
      it("should display caduque banner when candidacy is caduque without contestation", () => {
        visitDematerializedFeasibility({
          isCaduque: true,
          candidacyContestationsCaducite: [],
        });
        cy.get('[data-test="banner-is-caduque"]').should("exist");
        cy.get('[data-test="banner-caducite-confirmed"]').should("not.exist");
        cy.get('[data-test="banner-pending-caducite-contestation"]').should(
          "not.exist",
        );
      });

      it("should display caduque banner and ignore contestation when decision is CADUCITE_INVALIDATED", () => {
        visitDematerializedFeasibility({
          isCaduque: true,
          candidacyContestationsCaducite: [
            {
              certificationAuthorityContestationDecision:
                "CADUCITE_INVALIDATED",
            },
          ],
        });
        cy.get('[data-test="banner-is-caduque"]').should("exist");
        cy.get('[data-test="banner-caducite-confirmed"]').should("not.exist");
        cy.get('[data-test="banner-pending-caducite-contestation"]').should(
          "not.exist",
        );
      });
    });

    context("Candidacy has confirmed caducite", () => {
      it("should display caducite confirmed banner when candidacy is caduque and has confirmed contestation", () => {
        visitDematerializedFeasibility({
          isCaduque: true,
          candidacyContestationsCaducite: [
            {
              certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
            },
          ],
        });
        cy.get('[data-test="banner-caducite-confirmed"]').should("exist");
        cy.get('[data-test="banner-pending-caducite-contestation"]').should(
          "not.exist",
        );
        cy.get('[data-test="banner-is-caduque"]').should("not.exist");
      });
    });

    context("Candidacy has pending contestation", () => {
      it("should display pending contestation banner when candidacy has pending contestation", () => {
        const contestationSentAt = Date.now();
        visitDematerializedFeasibility({
          isCaduque: true,
          candidacyContestationsCaducite: [
            {
              certificationAuthorityContestationDecision: "DECISION_PENDING",
              contestationSentAt,
            },
          ],
        });
        cy.get('[data-test="banner-pending-caducite-contestation"]').should(
          "exist",
        );
        cy.get('[data-test="banner-caducite-confirmed"]').should("not.exist");
        cy.get('[data-test="banner-is-caduque"]').should("not.exist");
      });
    });

    context("Multiple contestations priority", () => {
      it("should prioritize DECISION_PENDING over CADUCITE_INVALIDATED status", () => {
        visitDematerializedFeasibility({
          isCaduque: true,
          candidacyContestationsCaducite: [
            {
              certificationAuthorityContestationDecision:
                "CADUCITE_INVALIDATED",
            },
            {
              certificationAuthorityContestationDecision: "DECISION_PENDING",
              contestationSentAt: Date.now() - 1000,
            },
          ],
        });
        cy.get('[data-test="banner-pending-caducite-contestation"]').should(
          "exist",
        );
        cy.get('[data-test="banner-is-caduque"]').should("not.exist");
        cy.get('[data-test="banner-caducite-confirmed"]').should("not.exist");
      });

      it("should prioritize CADUCITE_CONFIRMED over any other contestation decision", () => {
        visitDematerializedFeasibility({
          isCaduque: true,
          candidacyContestationsCaducite: [
            {
              certificationAuthorityContestationDecision: "DECISION_PENDING",
              contestationSentAt: Date.now() - 1000,
            },
            {
              certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
            },
            {
              certificationAuthorityContestationDecision:
                "CADUCITE_INVALIDATED",
            },
          ],
        });
        cy.get('[data-test="banner-pending-caducite-contestation"]').should(
          "not.exist",
        );
        cy.get('[data-test="banner-is-caduque"]').should("not.exist");
        cy.get('[data-test="banner-caducite-confirmed"]').should("exist");
      });
    });
  });
});
