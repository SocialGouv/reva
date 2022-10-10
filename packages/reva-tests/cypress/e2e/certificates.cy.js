import { stubMutation, stubQuery } from "../utils/graphql";

context("Certificates", () => {
  beforeEach(() => {
    cy.intercept("POST", "/graphql", (req) => {
      stubQuery(req, "candidate_confirmRegistration", "candidate-logged.json");
      stubQuery(req, "Certifications", "certifications.json");
      stubQuery(req, "Certification", "certification-c2.json");
      stubMutation(
        req,
        "candidacy_updateCertification",
        "updated-candidacy1.json"
      );
    });

    cy.visit("/confirmation");
    cy.wait("@candidate_confirmRegistration");
    cy.get('[data-test="project-home-select-certification"]').click();
    cy.get("#select_region").select("2");
    cy.wait("@Certifications");

    cy.get('[data-test="certification-select-c2"]').click();
    cy.wait("@Certification");
  });

  it("select region and submit certificate via summary", function () {
    cy.get('[data-test="certification-save"]').click();
    cy.wait("@candidacy_updateCertification");

    cy.get('[data-test="project-home-ready"]');
    cy.get('[data-test="certification-label"]').should("contain", "Titre 2");
  });

  it("select region and submit certificate via details", function () {
    cy.get('[data-test="certification-learn-more"]').click();

    cy.get('[data-test="certification-save"]').click();
    cy.wait("@candidacy_updateCertification");

    cy.get('[data-test="project-home-ready"]');
    cy.get('[data-test="certification-label"]').should("contain", "Titre 2");
  });
});
