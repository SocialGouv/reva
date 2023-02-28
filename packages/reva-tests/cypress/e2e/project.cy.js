import { stubMutation, stubQuery } from "../utils/graphql";

context("Project", () => {
  it("attempt to validate project", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate1.json");
      stubQuery(req, "getReferential", "referential.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="project-home-validate-locked"]').click();
    cy.get('[data-test="project-help"]').should("exist");
    cy.get('[data-test="project-help"] > [data-test="button-back"]').click();
    cy.get('[data-test="project-home-ready"]').should("exist");
  });

  it("confirm registration", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate2.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "submit_candidacy", "submitted-candidacy.json");
    });
    cy.login();
    cy.get('[data-test="project-home-loading"]');
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.wait(500);
    cy.get('[data-test="project-home-ready"]');
    cy.get('[data-test="project-home-validate"]').click();

    cy.get('[data-test="project-home-validated"]');
    cy.wait(500);
    cy.get('[data-test="project-home-submit"]').click();
    cy.wait("@submit_candidacy");
  });
});
