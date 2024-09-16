import { stubMutation, stubQuery } from "../utils/graphql";

const supportEmail = "support@vae.gouv.fr";

context("Dropped out", () => {
  it("log on a dropped-out project", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacy",
        "candidate2-dropped-out.json",
      );
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();

    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get('[data-test="candidacy-dropout-page"]');
  });

  it("dropped-out project page should display support email", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacy",
        "candidate2-dropped-out.json",
      );
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get('[data-test="candidacy-dropout-page"').should(
      "contain.text",
      `${supportEmail}`,
    );
  });
});
