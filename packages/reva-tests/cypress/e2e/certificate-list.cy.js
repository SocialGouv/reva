import { stubMutation, stubQuery } from "../utils/graphql";

context("Certificate list", () => {
  beforeEach(() => {
    cy.intercept("POST", "/graphql", (req) => {
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
    console.log(cy.get("#select_department").children("option"));
    cy.get("#select_department").children("option").should("have.length", 3); // 3 departements in referential but 1 inactive -> 3 options (2 departements and one inactive default empty choice)
    cy.get("#select_department")
      .children("option")
      .eq(1)
      .should("have.text", "Région 1");
    cy.get("#select_department")
      .children("option")
      .eq(2)
      .should("have.text", "Région 2");
  });
});
