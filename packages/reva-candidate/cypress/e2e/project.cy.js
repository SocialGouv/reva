import { stubMutation, stubQuery } from "../utils/graphql";

context("Project", () => {
  it("attempt to validate project", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getDepartments", "departments.json");
      stubMutation(req, "candidate_login", "candidate1.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="project-home-validate"]').should("be.disabled");
  });

  it("confirm registration", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getDepartments", "departments.json");
      stubMutation(req, "candidate_login", "candidate2.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "submit_candidacy", "submitted-candidacy.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();
    cy.get('[data-test="project-home-loading"]');
    cy.wait("@candidate_login");
    cy.wait("@getReferential");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.wait(500);
    cy.get('[data-test="project-home-ready"]');
    cy.get('[data-test="project-home-validate"]').click();

    cy.get('[data-test="project-submit"]').click();
    cy.wait("@submit_candidacy");
  });
});
