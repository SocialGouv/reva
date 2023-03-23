import { stubMutation, stubQuery } from "../utils/graphql";

context("Certificates", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate1.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "Certifications", "certifications.json");
      stubQuery(req, "Certification", "certification-c2.json");
      stubMutation(
        req,
        "candidacy_updateCertification",
        "updated-candidacy1.json"
      );
    });

    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="project-home-select-certification"]').click();
    cy.get("[name='select_department']").select("2");
    cy.wait("@Certifications");
  });

  it("select department and submit certificate via summary", function () {
    cy.get('[data-test="certification-select-c2"]').click();
    cy.get('[data-test="submit-certification-button"]').click();
    cy.wait("@candidacy_updateCertification");

    cy.get('[data-test="project-home-ready"]');
    cy.get('[data-test="certification-label"]').should("contain", "Titre 2");
  });
});
