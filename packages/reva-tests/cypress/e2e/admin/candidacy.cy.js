import { stubMutation, stubQuery } from "../../utils/graphql";

context("Candidacy", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getDepartments", "departments.json");
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

    cy.admin();
  });

  it("select department and submit certificate via summary", function () {
    cy.get('[data-test="certification-select-c2"]').click();
  });
});
