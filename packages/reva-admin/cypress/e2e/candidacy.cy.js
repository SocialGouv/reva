import { stubQuery } from "../../../reva-tests/cypress/utils/graphql";

context("Candidacy", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "active-features.json");
      stubQuery(
        req,
        "getCandidacyCountByStatus",
        "candidacy-count-by-status.json",
      );
      stubQuery(req, "getCandidacies", "candidacies.json");
    });

    cy.aap();
  });

  it("display all candidacies", function () {
    cy.get('[data-test="directory-group"]').children().should("have.length", 3);
  });
});
