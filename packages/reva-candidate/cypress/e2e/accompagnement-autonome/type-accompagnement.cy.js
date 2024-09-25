import { stubMutation, stubQuery } from "../../utils/graphql";

context("Type accompagnement", () => {
  it("should not show the type accompagnement in the timeline when the type_accompagnement is accompagne and the feature is inactive", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate1.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="type-accompagnement-timeline-element"]').should(
      "not.exist",
    );
  });

  it("should show the type accompagnement in the timeline when the type_accompagnement is accompagne and the feature is active", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate1.json");
      stubQuery(
        req,
        "activeFeaturesForConnectedUser",
        "accompagnement-autonome/features-type-accompagnement.json",
      );
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="type-accompagnement-timeline-element"]').should(
      "exist",
    );
    cy.get('[data-test="type-accompagnement-timeline-element-label"]').should(
      "contain.text",
      "VAE accompagnée",
    );
  });

  it("should show the type accompagnement in the timeline when the type_accompagnement is autonome", function () {
    cy.fixture("candidate1.json").then((candidate) => {
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
        "AUTONOME";
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
      });
    });
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="type-accompagnement-timeline-element"]').should(
      "exist",
    );
    cy.get('[data-test="type-accompagnement-timeline-element-label"]').should(
      "contain.text",
      "VAE en autonomie",
    );
  });
});
