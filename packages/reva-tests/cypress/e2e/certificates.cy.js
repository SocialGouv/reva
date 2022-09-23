import { stubMutation, stubQuery } from "../utils/graphql";

context("Certificates", () => {
  beforeEach(() => {
    cy.intercept("POST", "/graphql", (req) => {
      stubQuery(req, "getCandidacy", "referencial.json");
      stubQuery(req, "Certifications", "certifications.json");
      stubMutation(req, "create_candidacy", "created-candidacy1.json");
    });
    cy.visit("/");
  });

  it("select region and certificates", function () {
    cy.wait("@getCandidacy");
    cy.get("#select_region").select("2");
    cy.get('[data-test="certification-select-c1"]').click();
    cy.get('[data-test="certification-submit"]').click();
    cy.wait("@create_candidacy");
    cy.get('[data-test="submission-home-show-project-home"]');
  });
});
