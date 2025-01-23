import { stubQuery } from "../../../utils/graphql";
import candidacyWithDff from "./fixtures/candidacy-with-dff.json";

interface CandidacyContestation {
  certificationAuthorityContestationDecision: string;
}

function visitCandidacy({
  isCaduque = false,
  candidacyContestationsCaducite = [] as CandidacyContestation[],
} = {}) {
  cy.fixture("candidacy/candidacy.json").then((candidacy) => {
    candidacy.data.getCandidacyById.isCaduque = isCaduque;
    candidacy.data.getCandidacyById.candidacyContestationsCaducite =
      candidacyContestationsCaducite;
    candidacy.data.getCandidacyById.feasibilityFormat = "DEMATERIALIZED";
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "activeFeaturesForConnectedUser",
        "features/active-features.json",
      );
      stubQuery(req, "getCandidacyWithCandidateInfoForLayout", candidacy);
      stubQuery(req, "getCandidacyWithFeasibilityQuery", candidacy);
      stubQuery(
        req,
        "feasibilityGetActiveFeasibilityByCandidacyId",
        candidacyWithDff,
      );
    });
  });

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

describe("Candidacy Layout as a Certificateur", () => {
  context("Caducité badges visibility", () => {
    it("should display caducité badge when viewing a caduque candidacy without pending contestation", () => {
      visitCandidacy({
        isCaduque: true,
        candidacyContestationsCaducite: [],
      });
      cy.get('[data-test="caduque-badge"]').should("exist");
      cy.get('[data-test="contestation-badge"]').should("not.exist");
    });

    it("should display contestation badge when viewing a caduque candidacy with pending contestation", () => {
      visitCandidacy({
        isCaduque: true,
        candidacyContestationsCaducite: [
          { certificationAuthorityContestationDecision: "DECISION_PENDING" },
        ],
      });
      cy.get('[data-test="caduque-badge"]').should("not.exist");
      cy.get('[data-test="contestation-badge"]').should("exist");
    });

    it("should not display any caducité related badges when viewing a non-caduque candidacy", () => {
      visitCandidacy({
        isCaduque: false,
        candidacyContestationsCaducite: [],
      });
      cy.get('[data-test="caduque-badge"]').should("not.exist");
      cy.get('[data-test="contestation-badge"]').should("not.exist");
    });
  });
});
