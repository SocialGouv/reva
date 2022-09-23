import { stubMutation, stubQuery } from "../utils/graphql";

context("Certificates", () => {
  beforeEach(() => {
    cy.intercept("POST", "/graphql", (req) => {
      stubQuery(req, "getCandidacy", "referencial.json");
      stubQuery(req, "Certifications", "certifications.json");
      stubQuery(req, "Certification", "certification1.json");
      stubMutation(req, "create_candidacy", "created-candidacy1.json");
    });
  });

  it("select region and certificates", function () {
    cy.visit("/");
    cy.wait("@getCandidacy");

    cy.get("#select_region").select("2");
    cy.wait("@Certifications");

    cy.get('[data-test="certification-select-c1"]').click();
    cy.wait("@Certification");

    cy.get('[data-test="certification-submit"]').click();
    cy.wait("@create_candidacy");

    cy.get('[data-test="submission-home-show-project-home"]');
  });
});
