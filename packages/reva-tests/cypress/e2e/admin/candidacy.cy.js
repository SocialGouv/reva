import { stubQuery } from "../../utils/graphql";

context("Candidacy", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "getCandidacyCountByStatus",
        "admin/candidacy-count-by-status.json"
      );
      stubQuery(req, "getCandidacies", "admin/candidacies.json");
    });

    cy.admin();
  });

  it("select department and submit certificate via summary", function () {
    cy.get('[data-test="certification-select-c2"]').click();
  });
});
