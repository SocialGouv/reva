import { stubMutation, stubQuery } from "../utils/graphql";

context("Certificate list", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getDepartments", "departments.json");
      stubMutation(req, "candidate_login", "candidate1.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "Certifications", "certifications.json");
      stubMutation(
        req,
        "candidacy_updateCertification",
        "updated-candidacy1.json"
      );
    });

    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");
  });

  it("should show only 2 certifications out of 3 because the last one is inactive", function () {
    cy.get('[data-test="project-home-select-certification"]').click();
    cy.get("[name='select_department']").select("2");
    cy.wait("@Certifications");

    cy.get('[data-test="results"]').children("li").should("have.length", 2); // 3 certifications in referential but 1 inactive -> 2 li

    cy.get('[data-test="results"]')
      .children("li")
      .eq(0)
      .should("have.text", "34691Titre 1");

    cy.get('[data-test="results"]')
      .children("li")
      .eq(1)
      .should("have.text", "34692Titre 2");
  });
});
