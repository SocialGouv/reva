import { stubQuery } from "../utils/graphql";

context("Certificate list", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate1.json");
      stubQuery(req, "searchCertificationsForCandidate", "certifications.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });

    cy.login();

    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");
  });

  it.skip("should show only 2 certifications", function () {
    cy.get('[data-test="project-home-set-certification"]').click();

    cy.wait("@searchCertificationsForCandidate");

    cy.get('[data-test="results"]').children("li").should("have.length", 2);

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
