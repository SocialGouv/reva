import { stubQuery } from "../../utils/graphql";

import candidateAutonomeAdmissibleFeasibilityStep from "./fixtures/candidate-autonome-admissible-feasibility-step.json";
import candidateAutonomeFeasibilityStep from "./fixtures/candidate-autonome-feasibility-step.json";
import candidateAutonomeIncompleteFeasibilityStep from "./fixtures/candidate-autonome-incomplete-feasibility-step.json";
import candidateAutonomePendingFeasibilityStep from "./fixtures/candidate-autonome-pending-feasibility-step.json";
import candidateAutonomeRejectedFeasibilityStep from "./fixtures/candidate-autonome-rejected-feasibility-step.json";
const FEASIBILITY_TILE = '[data-test="feasibility-tile"]';
const FEASIBILITY_TILE_BUTTON = '[data-test="feasibility-tile"] button';

context("Accompagnement autonome - Dossier de faisabilité", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForLayout",
        candidateAutonomeFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidateAutonomeFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidateWithCandidacyForFeasibilityPage",
        candidateAutonomeFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForHome",
        candidateAutonomeFeasibilityStep,
      );
    });
    cy.login();

    cy.wait([
      "@candidate_getCandidateWithCandidacyForLayout",
      "@candidate_getCandidateWithCandidacyForHome",
      "@candidate_getCandidateWithCandidacyForDashboard",
    ]);
  });

  it("should show an active and editable feasibility element in the dashboard when the type_accompagnement is autonome and the candidacy status is 'PROJECT'", function () {
    cy.get(FEASIBILITY_TILE).should("exist");
    cy.get(FEASIBILITY_TILE_BUTTON).should("be.enabled");
  });

  it("should show the upload form on /feasibility when the type_accompagnement is autonome and the candidacy status is 'PROJECT'", function () {
    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-upload-form"]').should("exist");
  });

  it("should show the upload form on /feasibility when the type_accompagnement is autonome and the decision is INCOMPLETE", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForLayout",
        candidateAutonomeIncompleteFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidateWithCandidacyForFeasibilityPage",
        candidateAutonomeIncompleteFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidateAutonomeIncompleteFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForHome",
        candidateAutonomeIncompleteFeasibilityStep,
      );
    });

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-upload-form"]').should("exist");
  });

  it("should show an info box with file sending date on /feasibility page when the type_accompagnement is autonome, decision is PENDING", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForLayout",
        candidateAutonomePendingFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidateWithCandidacyForFeasibilityPage",
        candidateAutonomePendingFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidateAutonomePendingFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForHome",
        candidateAutonomePendingFeasibilityStep,
      );
    });

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-decision-pending"]').should("exist");
    cy.get('[data-test="feasibility-decision-pending"] > h3').should(
      "contain.text",
      "Dossier envoyé le 09/10/2024",
    );
  });

  it("should not show upload form, but show uploaded files on /feasibility page when the type_accompagnement is autonome, decision is PENDING", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForLayout",
        candidateAutonomePendingFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidateWithCandidacyForFeasibilityPage",
        candidateAutonomePendingFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidateAutonomePendingFeasibilityStep,
      );
    });

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-upload-form"]').should("not.exist");
    cy.get(
      '[data-test="feasibility-files-preview-dossier_de_faisabilite.pdf"]',
    ).should("exist");
    cy.get(
      '[data-test="feasibility-files-preview-dossier_de_faisabilite.pdf"] > * > label',
    ).should("contain.text", "dossier_de_faisabilite.pdf");
  });

  it("should show an info box with date of INCOMPLETE decision on /feasibility page when the type_accompagnement is autonome, decision is INCOMPLETE", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForLayout",
        candidateAutonomeIncompleteFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidateWithCandidacyForFeasibilityPage",
        candidateAutonomeIncompleteFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidateAutonomeIncompleteFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForHome",
        candidateAutonomeIncompleteFeasibilityStep,
      );
    });

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-decision-incomplete"]').should("exist");
    cy.get('[data-test="feasibility-decision-incomplete"] > h3').should(
      "contain.text",
      "Dossier déclaré incomplet le 09/10/2024",
    );
    cy.get('[data-test="feasibility-decision-incomplete"] > div > p').should(
      "contain.text",
      '"test comment"',
    );
  });

  it("should show an info box with date of ADMISSIBLE decision on /feasibility page when the type_accompagnement is autonome, decision is ADMISSIBLE", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForLayout",
        candidateAutonomeAdmissibleFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidateWithCandidacyForFeasibilityPage",
        candidateAutonomeAdmissibleFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidateAutonomeAdmissibleFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForHome",
        candidateAutonomeRejectedFeasibilityStep,
      );
    });

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-decision-admissible"]').should("exist");
    cy.get('[data-test="feasibility-decision-admissible"] > h3').should(
      "contain.text",
      "Dossier déclaré recevable le 09/10/2024",
    );
    cy.get('[data-test="decision-files"]').should("exist");
  });

  it("should show an info box with date of REJECTED decision on /feasibility page when the type_accompagnement is autonome, decision is REJECTED", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForLayout",
        candidateAutonomeRejectedFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidateWithCandidacyForFeasibilityPage",
        candidateAutonomeRejectedFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidateAutonomeRejectedFeasibilityStep,
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForHome",
        candidateAutonomeRejectedFeasibilityStep,
      );
    });

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-decision-rejected"]').should("exist");
    cy.get('[data-test="feasibility-decision-rejected"] > h3').should(
      "contain.text",
      "Dossier déclaré non recevable le 09/10/2024",
    );
    cy.get('[data-test="feasibility-decision-rejected"] > div > p').should(
      "contain.text",
      '"test comment"',
    );
  });
});
