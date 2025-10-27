import candidate1Data from "../../fixtures/candidate1.json";
import { stubMutation, stubQuery } from "../../utils/graphql";

const DASHBOARD_AUTONOME = '[data-testid="dashboard-autonome"]';
const DASHBOARD_TYPE_ACCOMPAGNEMENT_TILE =
  '[data-testid="type-accompagnement-tile"]';

const candidate = candidate1Data.data.candidate_getCandidateById;

const interceptCandidacy = (candidacy) => {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "candidate_getCandidateForCandidatesGuard",
      "candidate1-for-candidates-guard.json",
    );
    stubQuery(req, "getCandidateByIdForCandidateGuard", candidate1Data);
    stubQuery(
      req,
      "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      "candidacies-with-candidacy-1.json",
    );
    stubQuery(
      req,
      "getCandidacyByIdForCandidacyGuard",
      candidacy || "candidacy1.json",
    );
    stubQuery(req, "activeFeaturesForConnectedUser", {
      data: {
        activeFeaturesForConnectedUser: [],
      },
    });
    stubQuery(
      req,
      "getCandidacyByIdWithCandidate",
      candidacy || "candidacy1.json",
    );
    stubQuery(
      req,
      "getCandidacyByIdForDashboard",
      candidacy || "candidacy1.json",
    );
    stubQuery(
      req,
      "getCandidacyByIdForTypeAccompagnementPage",
      candidacy || "candidacy1.json",
    );
    stubMutation(
      req,
      "updateTypeAccompagnementForTypeAccompagnementPage",
      candidacy || "candidacy1-certification-titre-2-selected.json",
    );
  });
  cy.login();
  cy.wait([
    "@candidate_getCandidateForCandidatesGuard",
    "@getCandidateByIdForCandidateGuard",
    "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
    "@activeFeaturesForConnectedUser",
    "@getCandidacyByIdForCandidacyGuard",
    "@getCandidacyByIdWithCandidate",
    "@getCandidacyByIdForDashboard",
  ]);
};

context("Type accompagnement", () => {
  it("should show the type accompagnement in the dashboard when the type_accompagnement is autonome", function () {
    cy.fixture("candidacy1.json").then((candidacy) => {
      candidacy.data.getCandidacyById.typeAccompagnement = "AUTONOME";
      interceptCandidacy(candidacy);
    });

    cy.get(DASHBOARD_AUTONOME).should("exist");
  });

  it("should show the type_accompagnement update button when no certification is selected", function () {
    cy.fixture("candidacy1.json").then((candidacy) => {
      candidacy.data.getCandidacyById.typeAccompagnement = "AUTONOME";
      candidacy.data.getCandidacyById.certification = null;
      interceptCandidacy(candidacy);
    });

    cy.get(DASHBOARD_TYPE_ACCOMPAGNEMENT_TILE).should("exist");
    cy.get(DASHBOARD_TYPE_ACCOMPAGNEMENT_TILE).should("not.be.disabled");
  });

  it("should open the type_accompagnement choice page when i click on the update button", function () {
    cy.fixture("candidacy1-certification-titre-2-selected.json").then(
      (candidacy) => {
        candidacy.data.getCandidacyById.typeAccompagnement = "AUTONOME";
        interceptCandidacy(candidacy);
      },
    );

    cy.get(DASHBOARD_TYPE_ACCOMPAGNEMENT_TILE).click();
    cy.location("pathname").should(
      "equal",
      `/candidat/candidates/${candidate.id}/candidacies/c1/type-accompagnement/`,
    );
  });

  it("should allow me to complete the type-accompagnement choice page", function () {
    cy.fixture("candidacy1-certification-titre-2-selected.json").then(
      (candidacy) => {
        candidacy.data.getCandidacyById.typeAccompagnement = "AUTONOME";
        interceptCandidacy(candidacy);
      },
    );

    cy.visit(`/candidates/${candidate.id}/candidacies/c1/type-accompagnement`);
    cy.wait("@getCandidacyByIdForTypeAccompagnementPage");

    cy.get("h1").should("contain.text", "Modalités de parcours");
    cy.get(".type-accompagnement-autonome-radio-button").should("be.checked");
    cy.get(".type-accompagnement-accompagne-radio-button ~ label").click();
    cy.get(".type-accompagnement-accompagne-radio-button").should("be.checked");

    cy.get('[data-testid="submit-type-accompagnement-form-button"]').click();
    cy.get('[data-testid="submit-type-accompagnement-modal-button"]').click();
    cy.wait("@updateTypeAccompagnementForTypeAccompagnementPage");

    cy.wait(5000);
    cy.location("pathname").should(
      "equal",
      `/candidat/candidates/${candidate.id}/candidacies/c1/`,
    );
  });
});
