import { setDeviceId } from "../utils/device";
import { stubQuery } from "../utils/graphql";

context("Project", () => {
  beforeEach(() => {
    setDeviceId();
  });

  it("attempt to validate project", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubQuery(req, "getCandidacy", "candidacy1.json");
    });
    cy.visit("/");
    cy.wait("@getCandidacy");

    cy.get('[data-test="submission-home-show-project-home"]').click();
    cy.get('[data-test="project-home-validate-locked"]').click();
    cy.get('[data-test="project-help"]').should("exist");
    cy.get('[data-test="project-help"] > [data-test="button-back"]').click();
    cy.get('[data-test="project-home"]').should("exist");
  });
});
