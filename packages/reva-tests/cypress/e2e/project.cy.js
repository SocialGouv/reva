import { stubQuery } from "../utils/graphql";

context("Project", () => {
  it("attempt to validate project", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubQuery(req, "candidate_confirmRegistration", "candidate1.json");
    });
    cy.visit("/confirmation");
    cy.wait("@candidate_confirmRegistration");

    cy.get('[data-test="project-home-validate-locked"]').click();
    cy.get('[data-test="project-help"]').should("exist");
    cy.get('[data-test="project-help"] > [data-test="button-back"]').click();
    cy.get('[data-test="project-home-ready"]').should("exist");
  });
});
