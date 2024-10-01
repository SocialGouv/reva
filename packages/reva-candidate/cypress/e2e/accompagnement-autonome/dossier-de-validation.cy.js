import { stubMutation, stubQuery } from "../../utils/graphql";

context("Accompagnement autonome - Dossier de validation", () => {
  it("should show an inactive dossier de validation element in the timeline when the type_accompagnement is autonome and the candidacy status is 'PROJECT'", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element"]',
    ).should("exist");
    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element-update-button"]',
    ).should("be.disabled");
    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element-update-button"]',
    ).should("contain.text", "Compléter");
  });

  it("should show an active dossier de validation element in the timeline when the type_accompagnement is autonome and the candidacy status is 'DOSSIER_FAISABILITE_RECEVABLE' and route to the dossier de validation autonome page when clicked on", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "DOSSIER_FAISABILITE_RECEVABLE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element"]',
    ).should("exist");
    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element-update-button"]',
    ).should("be.enabled");
    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element-update-button"]',
    ).should("contain.text", "Compléter");

    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element-update-button"]',
    ).click();
    cy.location("pathname").should(
      "equal",
      "/candidat/dossier-de-validation-autonome/",
    );
  });
});