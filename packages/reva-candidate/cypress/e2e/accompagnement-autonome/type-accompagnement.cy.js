import { stubMutation, stubQuery } from "../../utils/graphql";

const DASHBOARD_AUTONOME = '[data-test="dashboard-autonome"]';
const DASHBOARD_TYPE_ACCOMPAGNEMENT_TILE =
  '[data-test="type-accompagnement-tile"]';

const interceptCandidacy = (candidate) => {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "candidate_getCandidateWithCandidacyForHome",
      candidate || "candidate1.json",
    );
    stubQuery(
      req,
      "candidate_getCandidateWithCandidacyForLayout",
      candidate || "candidate1.json",
    );

    stubQuery(
      req,
      "candidate_getCandidateWithCandidacyForDashboard",
      candidate || "candidate1.json",
    );
    stubQuery(
      req,
      "getCandidateWithCandidacyForTypeAccompagnementPage",
      candidate || "candidate1.json",
    );
    stubMutation(
      req,
      "updateTypeAccompagnementForTypeAccompagnementPage",
      candidate || "candidate1-certification-titre-2-selected.json",
    );
    stubQuery(req, "activeFeaturesForConnectedUser", {
      data: {
        activeFeaturesForConnectedUser: [],
      },
    });
  });
  cy.login();
  cy.wait([
    "@candidate_getCandidateWithCandidacyForLayout",
    "@candidate_getCandidateWithCandidacyForHome",
    "@candidate_getCandidateWithCandidacyForDashboard",
    "@activeFeaturesForConnectedUser",
  ]);
};

context("Type accompagnement", () => {
  it("should show the type accompagnement in the dashboard when the type_accompagnement is autonome", function () {
    cy.fixture("candidate1.json").then((candidate) => {
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
        "AUTONOME";
      interceptCandidacy(candidate);
    });

    cy.get(DASHBOARD_AUTONOME).should("exist");
  });

  it("should show the type_accompagnement update button when no certification is selected", function () {
    cy.fixture("candidate1.json").then((candidate) => {
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
        "AUTONOME";
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.certification =
        null;
      interceptCandidacy(candidate);
    });

    cy.get(DASHBOARD_TYPE_ACCOMPAGNEMENT_TILE).should("exist");
    cy.get(DASHBOARD_TYPE_ACCOMPAGNEMENT_TILE).should("not.be.disabled");
  });

  it("should open the type_accompagnement choice page when i click on the update button", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        interceptCandidacy(candidate);
      },
    );

    cy.get(DASHBOARD_TYPE_ACCOMPAGNEMENT_TILE).click();
    cy.location("pathname").should("equal", "/candidat/type-accompagnement/");
  });

  it("should allow me to complete the type-accompagnement choice page", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        interceptCandidacy(candidate);
      },
    );

    cy.visit("/type-accompagnement");
    cy.wait("@getCandidateWithCandidacyForTypeAccompagnementPage");

    cy.get("h1").should("contain.text", "Modalités de parcours");
    cy.get(".type-accompagnement-autonome-radio-button").should("be.checked");
    cy.get(".type-accompagnement-accompagne-radio-button ~ label").click();
    cy.get(".type-accompagnement-accompagne-radio-button").should("be.checked");

    cy.get('[data-test="submit-type-accompagnement-form-button"]').click();
    cy.get('[data-test="submit-type-accompagnement-modal-button"]').click();
    cy.wait("@updateTypeAccompagnementForTypeAccompagnementPage");

    cy.location("pathname").should("equal", "/candidat/");
  });
});
