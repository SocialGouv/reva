import { stubMutation, stubQuery } from "../utils/graphql";

context("Project", () => {
  it("attempt to validate project", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubMutation(req, "candidate_confirmRegistration", "candidate1.json");
      stubQuery(req, "getReferential", "referential.json");
    });
    cy.visit("/login?token=abc");
    cy.wait("@candidate_confirmRegistration");
    cy.wait("@getReferential");

    cy.get('[data-test="project-home-validate-locked"]').click();
    cy.get('[data-test="project-help"]').should("exist");
    cy.get('[data-test="project-help"] > [data-test="button-back"]').click();
    cy.get('[data-test="project-home-ready"]').should("exist");
  });

  it("confirm registration", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubMutation(req, "candidate_confirmRegistration", "candidate2.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "submit_candidacy", "candidate2.json");
    });
    cy.visit("/login?token=abc");
    cy.get('[data-test="project-home-loading"]');
    cy.wait("@candidate_confirmRegistration");
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
