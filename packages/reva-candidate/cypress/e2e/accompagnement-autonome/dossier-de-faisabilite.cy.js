import { stubQuery } from "../../utils/graphql";

import candidacy1AutonomeAdmissibleFeasibilityStep from "./fixtures/candidacy1-autonome-admissible-feasibility-step.json";
import candidacy1AutonomeFeasibilityStep from "./fixtures/candidacy1-autonome-feasibility-step.json";
import candidacy1AutonomeIncompleteFeasibilityStep from "./fixtures/candidacy1-autonome-incomplete-feasibility-step.json";
import candidacy1AutonomePendingFeasibilityStep from "./fixtures/candidacy1-autonome-pending-feasibility-step.json";
import candidacy1AutonomeRejectedFeasibilityStep from "./fixtures/candidacy1-autonome-rejected-feasibility-step.json";

const FEASIBILITY_TILE = '[data-test="feasibility-tile"]';
const FEASIBILITY_TILE_BUTTON = '[data-test="feasibility-tile"] button';

context("Accompagnement autonome - Dossier de faisabilité", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-1.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForCandidacyGuard",
        candidacy1AutonomeFeasibilityStep,
      );
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "getCandidacyByIdWithCandidate",
        candidacy1AutonomeFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForDashboard",
        candidacy1AutonomeFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForFeasibilityPage",
        candidacy1AutonomeFeasibilityStep,
      );
    });
    cy.login();

    cy.wait([
      "@candidate_getCandidateWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);
  });

  it("should show an active and editable feasibility element in the dashboard when the type_accompagnement is autonome and the candidacy status is 'PROJECT'", function () {
    cy.get(FEASIBILITY_TILE).should("exist");
    cy.get(FEASIBILITY_TILE_BUTTON).should("be.enabled");
  });

  it("should show the upload form on /feasibility when the type_accompagnement is autonome and the candidacy status is 'PROJECT'", function () {
    cy.visit("/c1/feasibility/");
    cy.wait("@getCandidacyByIdForFeasibilityPage");

    cy.get('[data-test="feasibility-upload-form"]').should("exist");
  });

  it("should show the upload form on /feasibility when the type_accompagnement is autonome and the decision is INCOMPLETE", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-1.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForCandidacyGuard",
        candidacy1AutonomeIncompleteFeasibilityStep,
      );
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "getCandidacyByIdWithCandidate",
        candidacy1AutonomeIncompleteFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForDashboard",
        candidacy1AutonomeIncompleteFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForFeasibilityPage",
        candidacy1AutonomeIncompleteFeasibilityStep,
      );
    });

    cy.visit("/c1/feasibility/");
    cy.wait("@getCandidacyByIdForFeasibilityPage");

    cy.get('[data-test="feasibility-upload-form"]').should("exist");
  });

  it("should show an info box with file sending date on /feasibility page when the type_accompagnement is autonome, decision is PENDING", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-1.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForCandidacyGuard",
        candidacy1AutonomePendingFeasibilityStep,
      );
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "getCandidacyByIdWithCandidate",
        candidacy1AutonomePendingFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForDashboard",
        candidacy1AutonomePendingFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForFeasibilityPage",
        candidacy1AutonomePendingFeasibilityStep,
      );
    });

    cy.visit("/c1/feasibility/");
    cy.wait("@getCandidacyByIdForFeasibilityPage");

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
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-1.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForCandidacyGuard",
        candidacy1AutonomePendingFeasibilityStep,
      );
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "getCandidacyByIdWithCandidate",
        candidacy1AutonomePendingFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForDashboard",
        candidacy1AutonomePendingFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForFeasibilityPage",
        candidacy1AutonomePendingFeasibilityStep,
      );
    });

    cy.visit("/c1/feasibility/");
    cy.wait("@getCandidacyByIdForFeasibilityPage");

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
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-1.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForCandidacyGuard",
        candidacy1AutonomeIncompleteFeasibilityStep,
      );
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "getCandidacyByIdWithCandidate",
        candidacy1AutonomeIncompleteFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForDashboard",
        candidacy1AutonomeIncompleteFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForFeasibilityPage",
        candidacy1AutonomeIncompleteFeasibilityStep,
      );
    });

    cy.visit("/c1/feasibility/");
    cy.wait("@getCandidacyByIdForFeasibilityPage");

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
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-1.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForCandidacyGuard",
        candidacy1AutonomeAdmissibleFeasibilityStep,
      );
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "getCandidacyByIdWithCandidate",
        candidacy1AutonomeAdmissibleFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForDashboard",
        candidacy1AutonomeAdmissibleFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForFeasibilityPage",
        candidacy1AutonomeAdmissibleFeasibilityStep,
      );
    });

    cy.visit("/c1/feasibility/");
    cy.wait("@getCandidacyByIdForFeasibilityPage");

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
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-1.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForCandidacyGuard",
        candidacy1AutonomeRejectedFeasibilityStep,
      );
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "getCandidacyByIdWithCandidate",
        candidacy1AutonomeRejectedFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForDashboard",
        candidacy1AutonomeRejectedFeasibilityStep,
      );
      stubQuery(
        req,
        "getCandidacyByIdForFeasibilityPage",
        candidacy1AutonomeRejectedFeasibilityStep,
      );
    });

    cy.visit("/c1/feasibility/");
    cy.wait("@getCandidacyByIdForFeasibilityPage");

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
