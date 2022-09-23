import { stubMutation } from "../utils/graphql";

context("Certificates", () => {
  beforeEach(() => {
    cy.visit("/");

    cy.intercept("POST", "/graphql", (req) => {
      stubMutation(req, "create_candidacy");
    });
  });

  it("select region and certificates", function () {
    cy.get("#select_region").select("11");
    cy.get('[data-test="results"] [data-type="card"]').eq(4).click();
    cy.get('[data-test="certification-submit"]').click();
    cy.wait("@create_candidacy");
    cy.get('[data-test="submission-home-show-project-home"]');
  });
});
