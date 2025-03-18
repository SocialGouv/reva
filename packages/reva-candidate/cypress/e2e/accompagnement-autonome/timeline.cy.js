import { stubQuery } from "../../utils/graphql";

context("Accompagnement Autonome Timeline", () => {
  it("should show the accompagné timeline", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate1.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();

    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="accompagne-project-timeline"]').should("exist");
  });

  it("should show the autonome timeline", function () {
    cy.fixture("candidate1.json").then((candidate) => {
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
        "AUTONOME";
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      });
    });

    cy.login();

    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="autonome-project-timeline"]').should("exist");
  });
});
