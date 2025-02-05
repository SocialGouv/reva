import { stubQuery } from "../../../utils/graphql";

interface CandidacyContestation {
  certificationAuthorityContestationDecision: string;
  contestationSentAt?: number;
  contestationReason?: string;
}

const DATE_NOW = Date.now();
const CANDIDACY_ID = "46206f6b-0a59-4478-9338-45e3a8d968e4";
const URL_FEASIBILITY = "/candidacies/" + CANDIDACY_ID + "/feasibility";

function visitCaduciteContestation({
  candidacyContestationsCaducite = [] as CandidacyContestation[],
  lastActivityDate = DATE_NOW,
  feasibilityDecisionSentAt = DATE_NOW,
} = {}) {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "activeFeaturesForConnectedUser",
      "features/active-features.json",
    );
    stubQuery(req, "getCandidacyCaduciteContestationQuery", {
      data: {
        getCandidacyById: {
          id: CANDIDACY_ID,
          candidate: {
            firstname: "Alice",
            lastname: "Doe",
          },
          feasibility: {
            decisionSentAt: feasibilityDecisionSentAt,
          },
          isCaduque: true,
          lastActivityDate,
          readyForJuryEstimatedAt: 1746230400000,
          candidacyContestationsCaducite,
        },
      },
    });

    stubQuery(
      req,
      "getCandidacyWithCandidateInfoForLayout",
      "candidacy/candidacy.json",
    );
    stubQuery(req, "updateContestationCaduciteDecisionQuery", {
      data: {
        candidacy_contestation_caducite_update_certification_authority_contestation_decision:
          {
            id: CANDIDACY_ID,
          },
      },
    });
  });

  cy.certificateur(URL_FEASIBILITY + "/caducite-contestation");

  cy.wait([
    "@activeFeaturesForConnectedUser",
    "@getCandidacyCaduciteContestationQuery",
    "@getCandidacyWithCandidateInfoForLayout",
  ]);
}

describe("Caducite Contestation Page as Certificateur", () => {
  context("Page display", () => {
    it("should display all required form elements", () => {
      const contestationSentAt = DATE_NOW;
      const lastActivityDate = DATE_NOW - 1000000;
      const feasibilityDecisionSentAt = DATE_NOW - 2000000;

      visitCaduciteContestation({
        candidacyContestationsCaducite: [
          {
            certificationAuthorityContestationDecision: "DECISION_PENDING",
            contestationSentAt,
            contestationReason: "Test reason",
          },
        ],
        lastActivityDate,
        feasibilityDecisionSentAt,
      });

      cy.get('[data-test="caducite-contestation-form"]').should("exist");
      cy.get('[data-test="caducite-contestation-decision-radio-buttons"]')
        .should("exist")
        .within(() => {
          cy.get('input[value="CADUCITE_CONFIRMED"]').should("exist");
          cy.get('input[value="CADUCITE_INVALIDATED"]').should("exist");
        });
      cy.get('button[type="submit"]').should("exist");
      cy.get('button[type="reset"]').should("exist");
    });
  });

  context("Form interactions", () => {
    beforeEach(() => {
      visitCaduciteContestation({
        candidacyContestationsCaducite: [
          {
            certificationAuthorityContestationDecision: "DECISION_PENDING",
            contestationSentAt: DATE_NOW,
          },
        ],
      });
    });

    it("should handle confirming caducite decision flow", () => {
      cy.get('[data-test="caducite-contestation-decision-radio-buttons"]')
        .find('input[value="CADUCITE_CONFIRMED"]')
        .click({ force: true })
        .should("be.checked");

      cy.get('button[type="submit"]').click();
      cy.url().should("include", URL_FEASIBILITY);
    });

    it("should handle invalidating caducite decision flow", () => {
      cy.get('[data-test="caducite-contestation-decision-radio-buttons"]')
        .find('input[value="CADUCITE_INVALIDATED"]')
        .click({ force: true })
        .should("be.checked");

      cy.get('button[type="submit"]').click();
      cy.url().should("include", URL_FEASIBILITY);
    });

    it("should reset form correctly", () => {
      cy.get('[data-test="caducite-contestation-decision-radio-buttons"]')
        .find('input[value="CADUCITE_CONFIRMED"]')
        .click({ force: true })
        .should("be.checked");

      cy.get('button[type="reset"]').click();
      cy.get('[data-test="caducite-contestation-decision-radio-buttons"]')
        .find("input:checked")
        .should("not.exist");
    });
  });

  context("Navigation", () => {
    it("should navigate via breadcrumb", () => {
      visitCaduciteContestation({
        candidacyContestationsCaducite: [
          {
            certificationAuthorityContestationDecision: "DECISION_PENDING",
            contestationSentAt: DATE_NOW,
          },
        ],
      });

      cy.get("a[href*='" + URL_FEASIBILITY + "']")
        .first()
        .click();
      cy.url().should("include", URL_FEASIBILITY);
    });
  });
});
