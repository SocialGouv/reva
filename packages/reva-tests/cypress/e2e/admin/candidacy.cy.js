import { stubQuery } from "../../utils/graphql";

context("Candidacy", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidacy_candidacyCountByStatus",
        "admin/candidacy-count-by-status.json"
      );
      stubQuery(
        req,
        "candidacy_getCandidacies1555104720",
        "admin/candidacies.json"
      );
    });

    cy.admin();
  });

  it("select department and submit certificate via summary", function () {
    cy.get('[data-test="certification-select-c2"]').click();
  });
});
